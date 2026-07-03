// Vercel 默认会解析 JSON body，但 multipart 需要 raw stream
export const config = {
  api: {
    bodyParser: false,
  },
};

import Busboy from 'busboy';
import { fetchAndExtract, generateSlug } from './extract-content.js';
import { sendPublishedNotification, sendReceivedNotification } from './notify-email.js';

const STRAPI_URL = 'http://8.149.139.66:1337';
const ADMIN_EMAIL = 'admin@hser.ren';
const ADMIN_PASSWORD = 'StrapiAdmin2026';

const SUBMISSION_TYPES = {
  regulation: { category: 'submission-regulation', label: '法规文件' },
  accident: { category: 'submission-accident', label: '事故报告' },
  standard: { category: 'submission-standard', label: '国标地标' },
  document: { category: 'submission-document', label: '资料文档' },
  'ai-app': { category: 'submission-ai-app', label: 'AI应用' },
};

const AUTO_PUBLISH_TYPES = ['regulation', 'accident', 'standard']; // 可自动发布的类型

/**
 * 解析 multipart/form-data 请求
 */
function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const fields = {};
    const files = [];

    try {
      const busboy = Busboy({
        headers: req.headers,
        limits: { fileSize: 50 * 1024 * 1024, files: 5 },
      });

      busboy.on('field', (name, val) => { fields[name] = val; });

      busboy.on('file', (fieldname, file, info) => {
        const { filename, mimeType } = info;
        const chunks = [];
        file.on('data', (chunk) => chunks.push(chunk));
        file.on('end', () => {
          files.push({ fieldname, filename, mimeType, buffer: Buffer.concat(chunks) });
        });
        file.on('limit', () => {
          reject(new Error(`文件 ${filename} 超过 50MB 限制`));
        });
      });

      busboy.on('finish', () => resolve({ fields, files }));
      busboy.on('error', (err) => reject(err));
      req.pipe(busboy);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * 登录 Strapi 获取 admin token
 */
async function loginStrapi() {
  const res = await fetch(`${STRAPI_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Strapi 登录失败 (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data.data.token;
}

/**
 * 上传附件到 Strapi 媒体库
 */
async function uploadToStrapi(file, token) {
  const formData = new FormData();
  const blob = new Blob([file.buffer], { type: file.mimeType });
  formData.append('files', blob, file.filename);

  const res = await fetch(`${STRAPI_URL}/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`附件上传失败 (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data[0];
}

/**
 * 创建 Message 记录
 */
async function createMessage({ title, content, author, email, category, token }) {
  const res = await fetch(
    `${STRAPI_URL}/content-manager/collection-types/api::message.message`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        content,
        author,
        email: email || '投稿@anonymous',
        category,
        slug: generateSlug(title, 'msg'),
      }),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`创建记录失败 (${res.status}): ${text}`);
  }

  const json = await res.json();
  return json;
}

/**
 * 获取 Strapi collection 的 API path 和创建 entry
 */
function getCollectionInfo(type) {
  const map = {
    regulation: { apiPath: 'regulations', singular: 'regulation' },
    accident: { apiPath: 'accidents', singular: 'accident' },
    standard: { apiPath: 'standards', singular: 'standard' },
  };
  return map[type] || null;
}

/**
 * 自动发布到目标 collection
 * 使用 content-manager API (admin token)
 */
async function autoPublishToStrapi({ type, extractResult, submission, token }) {
  const collectionInfo = getCollectionInfo(type);
  if (!collectionInfo) return { success: false, error: `不支持的类型: ${type}` };

  const { title, content, source, publishDate } = extractResult;

  // 构建 entry 数据（根据 type 映射字段）
  let entryData = {};

  if (type === 'regulation') {
    entryData = {
      title: title || submission.title,
      content: content,
      publishDate: publishDate || new Date().toISOString().slice(0, 10),
      category: 'safety', // 默认安全类
      source: source || '用户投稿',
      slug: generateSlug(title || submission.title, 'reg'),
      description: (content || '').slice(0, 200).replace(/\n/g, ' '),
    };
  } else if (type === 'accident') {
    entryData = {
      title: title || submission.title,
      content: content,
      date: publishDate || new Date().toISOString().slice(0, 10),
      severity: 'general', // 默认一般
      casualties: '',
      location: '',
      category: 'other_injury', // 默认其他伤害
      province: '',
      slug: generateSlug(title || submission.title, 'acc'),
      description: (content || '').slice(0, 200).replace(/\n/g, ' '),
      company: '',
    };
  } else if (type === 'standard') {
    entryData = {
      title: title || submission.title,
      content: content,
      publishDate: publishDate || new Date().toISOString().slice(0, 10),
      category: 'safety',
      source: source || '用户投稿',
      slug: generateSlug(title || submission.title, 'std'),
      standardNo: '',
      effectiveDate: '',
      regionLevel: 'national',
      description: (content || '').slice(0, 200).replace(/\n/g, ' '),
    };
  }

  const collection = collectionInfo.apiPath;

  // 尝试用 Public API 创建（需要 API Token 权限）
  // 先用 content-manager API 确保有完整权限
  const apiUrl = `${STRAPI_URL}/content-manager/collection-types/api::${collectionInfo.singular}.${collection}`;

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(entryData),
    });

    if (!res.ok) {
      const errText = await res.text();
      // 如果字段校验失败，记录但不阻塞
      console.error(`Publish failed for ${type}:`, errText.slice(0, 500));
      return { success: false, error: `发布失败: ${errText.slice(0, 200)}` };
    }

    const result = await res.json();
    const entryId = result.data?.documentId || result.data?.id;
    console.log(`Auto-published ${type}: ${entryId || 'unknown'}`);

    return {
      success: true,
      entryId,
      slug: entryData.slug,
      collection,
    };
  } catch (err) {
    console.error(`Auto-publish error for ${type}:`, err.message);
    return { success: false, error: `发布异常: ${err.message}` };
  }
}

/**
 * 更新 Message 记录（标记发布状态）
 */
async function updateMessageStatus(messageId, updates, token) {
  try {
    const res = await fetch(
      `${STRAPI_URL}/content-manager/collection-types/api::message.message/${messageId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      },
    );
    if (!res.ok) {
      console.error(`Update message status failed: ${res.status}`);
    }
  } catch (err) {
    console.error('Update message status error:', err.message);
  }
}

export default async function handler(req, res) {
  // CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '仅支持 POST 请求' });
  }

  try {
    // 1. 解析 multipart 表单
    const { fields, files } = await parseMultipart(req);
    console.log('Parsed fields:', Object.keys(fields));

    const { nickname, email, type, title, sourceUrl, notes } = fields;

    // 2. 校验必填字段
    if (!nickname || !nickname.trim()) {
      return res.status(400).json({ error: '请填写昵称' });
    }
    if (!type || !SUBMISSION_TYPES[type]) {
      return res.status(400).json({ error: '请选择有效的投稿类型' });
    }
    if (!title || !title.trim()) {
      return res.status(400).json({ error: '请填写标题' });
    }

    const subType = SUBMISSION_TYPES[type];

    // 3. 登录 Strapi
    let token;
    try {
      token = await loginStrapi();
    } catch (loginErr) {
      console.error('Strapi login failed:', loginErr);
      return res.status(502).json({ error: '后台服务连接失败，请稍后重试' });
    }

    // 4. 上传附件
    let uploadedAttachments = [];
    if (files && files.length > 0) {
      for (const file of files) {
        try {
          const uploaded = await uploadToStrapi(file, token);
          uploadedAttachments.push({
            id: uploaded.id,
            name: uploaded.name || file.filename,
            url: uploaded.url,
            mime: uploaded.mime,
            size: uploaded.size,
          });
        } catch (uploadErr) {
          console.error(`File upload failed for ${file.filename}:`, uploadErr);
        }
      }
    }

    // 5. 构建基础 content
    let baseContent = '';
    if (sourceUrl) baseContent += `来源链接：${sourceUrl}\n`;
    if (notes) baseContent += `备注说明：${notes}\n`;
    if (uploadedAttachments.length > 0) {
      baseContent += `\n附件列表：\n`;
      uploadedAttachments.forEach((att, i) => {
        baseContent += `${i + 1}. ${att.name} (${att.url || att.id})\n`;
      });
    }

    // 6. 自动提取 + 自动发布（仅 regulation/accident/standard）
    let autoPublished = false;
    let publishInfo = null;
    let extractResult = null;
    let publishUrl = '';
    let finalContent = baseContent || '（无额外说明）';
    let msgStatus = 'pending_review';

    if (AUTO_PUBLISH_TYPES.includes(type) && sourceUrl) {
      console.log(`Attempting auto-extract for ${type}: ${sourceUrl}`);
      extractResult = await fetchAndExtract(sourceUrl, type);

      if (extractResult.success) {
        console.log(`Extraction succeeded: title="${extractResult.title?.slice(0, 40)}", content_length=${extractResult.content?.length}`);

        // 自动发布到 Strapi collection
        publishInfo = await autoPublishToStrapi({
          type,
          extractResult,
          submission: { title: title.trim(), sourceUrl },
          token,
        });

        if (publishInfo.success) {
          autoPublished = true;
          publishUrl = `https://hser.ren/${type === 'standard' ? 'standards' : type + 's'}/${publishInfo.slug || publishInfo.entryId}`;
          finalContent = `✅ 已自动发布\n来源链接：${sourceUrl}\n备注：${notes || '无'}\n\n--- 自动提取内容 ---\n\n${extractResult.content}`;
          msgStatus = 'auto_published';
          console.log(`Auto-published successfully: ${publishUrl}`);
        } else {
          // 提取成功但发布失败：保留提取内容但设为 manual review
          finalContent = `⚠️ 自动提取成功但发布失败：${publishInfo.error}\n\n--- 提取内容 ---\n\n${extractResult.content}\n\n--- 原始信息 ---\n\n${baseContent}`;
          msgStatus = 'extract_ok_publish_failed';
          console.error(`Auto-publish failed: ${publishInfo.error}`);
        }
      } else {
        // 提取失败
        finalContent = `⚠️ 自动提取失败：${extractResult.error}\n\n--- 来源链接 ---\n${sourceUrl}\n\n--- 原始信息 ---\n\n${baseContent}`;
        msgStatus = 'extract_failed';
        console.log(`Extraction failed: ${extractResult.error}`);
      }
    } else if (type === 'document' || type === 'ai-app') {
      // 资料文档 / AI应用：需要人工处理
      msgStatus = 'pending_review';
    }

    // 7. 创建 Message 记录
    const message = await createMessage({
      title: title.trim(),
      content: finalContent,
      author: nickname.trim(),
      email: (email || '').trim(),
      category: `${subType.category}|${msgStatus}|${publishUrl || ''}`,
      token,
    });

    console.log('Message created:', message.data?.id || message.data?.documentId);

    // 8. 发送邮件通知
    const emailAddr = (email || '').trim();
    const toName = nickname.trim();

    if (emailAddr) {
      if (autoPublished) {
        // 自动发布成功 → 发送"已发布"通知
        await sendPublishedNotification({
          toEmail: emailAddr,
          toName,
          title: title.trim(),
          type,
          publishUrl,
        });
      } else {
        // 需要审核 → 发送"已接收"通知
        await sendReceivedNotification({
          toEmail: emailAddr,
          toName,
          title: title.trim(),
          type,
        });
      }
    }

    // 9. 返回成功
    return res.status(200).json({
      success: true,
      message: autoPublished
        ? '✅ 投稿已自动发布！详情已发送至你的邮箱。'
        : '投稿成功！审核通过后将发布到对应栏目。',
      data: {
        id: message.data?.id || message.data?.documentId,
        type,
        status: msgStatus,
        autoPublished,
        publishUrl: publishUrl || undefined,
        attachments: uploadedAttachments.length,
        emailSent: !!emailAddr,
      },
    });
  } catch (error) {
    console.error('Submit handler error:', error);
    return res.status(500).json({ error: '提交失败，请稍后重试。' });
  }
}
