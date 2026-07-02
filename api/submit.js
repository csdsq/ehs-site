// Vercel 默认会解析 JSON body，但 multipart 需要 raw stream
export const config = {
  api: {
    bodyParser: false,
  },
};

import Busboy from 'busboy';

const STRAPI_URL = 'http://8.149.139.66:1337';
const ADMIN_EMAIL = 'admin@hser.ren';
const ADMIN_PASSWORD = 'StrapiAdmin2026';

const SUBMISSION_TYPES = {
  regulation: { category: 'submission-regulation', label: '法规文件' },
  accident: { category: 'submission-accident', label: '事故报告' },
  standard: { category: 'submission-standard', label: '标准规范' },
  document: { category: 'submission-document', label: '资料文档' },
};

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
        limits: {
          fileSize: 10 * 1024 * 1024, // 10MB
          files: 5,
        },
      });

      busboy.on('field', (name, val) => {
        fields[name] = val;
      });

      busboy.on('file', (fieldname, file, info) => {
        const { filename, mimeType } = info;
        const chunks = [];
        file.on('data', (chunk) => chunks.push(chunk));
        file.on('end', () => {
          files.push({
            fieldname,
            filename,
            mimeType,
            buffer: Buffer.concat(chunks),
          });
        });
        file.on('limit', () => {
          reject(new Error(`文件 ${filename} 超过 10MB 限制`));
        });
      });

      busboy.on('finish', () => {
        resolve({ fields, files });
      });

      busboy.on('error', (err) => {
        reject(err);
      });

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
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    }),
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
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`附件上传失败 (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data[0]; // 返回上传后的文件信息
}

/**
 * 构建投稿的 content 字段（含附件信息）
 */
function buildContent({ nickname, email, sourceUrl, notes, attachments }) {
  let content = '';

  if (sourceUrl) {
    content += `来源链接：${sourceUrl}\n`;
  }
  if (notes) {
    content += `备注说明：${notes}\n`;
  }
  if (attachments && attachments.length > 0) {
    content += `\n附件列表：\n`;
    attachments.forEach((att, i) => {
      content += `${i + 1}. ${att.name} (${att.url || att.id})\n`;
    });
  }

  return content || '（无额外说明）';
}

/**
 * 生成唯一 slug
 */
function generateSlug(title) {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  const ts = Date.now().toString(36);
  return `sub-${slug}-${ts}`;
}

/**
 * 创建 Message 记录（通过 content-manager API + admin token）
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
        slug: generateSlug(title),
      }),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`创建记录失败 (${res.status}): ${text}`);
  }

  const json = await res.json();
  return json; // content-manager API 返回 {data: {...}}
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
    console.log('Files count:', files.length);

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

    // 3. 登录 Strapi 获取 admin token
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
          // 单个文件上传失败不影响整体
        }
      }
    }

    // 5. 构建 content
    const content = buildContent({
      nickname: nickname.trim(),
      email: (email || '').trim(),
      sourceUrl: (sourceUrl || '').trim(),
      notes: (notes || '').trim(),
      attachments: uploadedAttachments,
    });

    // 6. 创建 Message 记录
    const message = await createMessage({
      title: title.trim(),
      content,
      author: nickname.trim(),
      email: (email || '').trim(),
      category: subType.category,
      token,
    });

    console.log('Submission created:', JSON.stringify(message.data));

    // 7. 返回成功
    return res.status(200).json({
      success: true,
      message: '投稿成功！审核通过后将发布到对应栏目。',
      data: {
        id: message.data?.id || message.data?.documentId,
        type,
        category: subType.category,
        attachments: uploadedAttachments.length,
      },
    });
  } catch (error) {
    console.error('Submit handler error:', error);
    // 开发调试期间返回详细错误
    return res.status(500).json({
      error: '提交失败',
      detail: error.message,
      stack: error.stack?.split('\n').slice(0, 5).join('\n'),
    });
  }
}