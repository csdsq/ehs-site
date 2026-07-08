import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

/**
 * 用户投稿/资料提交接口 —— Astro 服务端端点（ECS Node SSR 下运行）
 * 取代原 Vercel Serverless Function（api/submit.js），因为 ECS 迁移后 Vercel 函数不再执行。
 * 路由为 /submitform（非 /api/submit，因 /api/* 仍被 Vercel 旧规则拦截）。
 *
 * 前端 src/pages/submit/index.astro 的表单 POST multipart/form-data 到这里，字段：
 *   nickname, email, type, title, sourceUrl, notes, attachments(可选多文件)
 * 返回：{ success, message, data }
 *
 * 处理：
 *   1) 校验必填（nickname / type / title）
 *   2) 登录 Strapi admin，上传附件到媒体库
 *   3) 在 message 集合创建一条投稿记录（category 标记类型+状态+发布链接）
 *   4) 给投稿人发"已接收/将审核"邮件通知（SMTP_PASS 未配置则跳过）
 *
 * 说明：原 Vercel 版本含「从 sourceUrl 抓取正文 + 自动发布到对应栏目」逻辑（依赖无头浏览器），
 * 该能力较重且有外部依赖，本端点暂未移植；投稿统一进入 message 集合人工审核发布。
 * 如需恢复自动发布，可后续接入轻量抓取服务。
 */
const STRAPI_URL = process.env.STRAPI_URL || 'http://127.0.0.1:1337';
const ADMIN_EMAIL = process.env.STRAPI_ADMIN_EMAIL || 'admin@hser.ren';
const ADMIN_PASSWORD = process.env.STRAPI_ADMIN_PASSWORD || 'StrapiAdmin2026';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.qq.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465', 10);
const SMTP_USER = process.env.SMTP_USER || 'csdsq@qq.com';
const SMTP_PASS = process.env.SMTP_PASS;

const TYPE_LABELS: Record<string, string> = {
  regulation: '法规文件',
  accident: '事故报告',
  standard: '国标地标',
  document: '资料文档',
  'ai-app': 'AI应用',
};

export const prerender = false;

let transporter: nodemailer.Transporter | null = null;
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: true,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return transporter;
}

async function loginStrapi(): Promise<string> {
  const res = await fetch(`${STRAPI_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Strapi登录失败 ${res.status}: ${t.slice(0, 200)}`);
  }
  return (await res.json()).data.token;
}

async function uploadToStrapi(file: File, token: string) {
  const fd = new FormData();
  fd.append('files', file, file.name);
  const res = await fetch(`${STRAPI_URL}/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`附件上传失败 ${res.status}: ${t.slice(0, 200)}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data[0] : data;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  if (request.method !== 'POST') {
    return json({ error: '仅支持 POST 请求' }, 405);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: '请求体不是合法的 multipart 表单' }, 400);
  }

  const nickname = (form.get('nickname') as string)?.trim() || '';
  const email = (form.get('email') as string)?.trim() || '';
  const type = (form.get('type') as string) || '';
  const title = (form.get('title') as string)?.trim() || '';
  const sourceUrl = (form.get('sourceUrl') as string)?.trim() || '';
  const notes = (form.get('notes') as string)?.trim() || '';

  if (!nickname) return json({ error: '请填写昵称' }, 400);
  if (!TYPE_LABELS[type]) return json({ error: '请选择有效的投稿类型' }, 400);
  if (!title) return json({ error: '请填写标题' }, 400);

  const subType = TYPE_LABELS[type];

  let token: string;
  try {
    token = await loginStrapi();
  } catch (e) {
    console.error('[submit] strapi login failed:', (e as Error).message);
    return json({ error: '后台服务连接失败，请稍后重试' }, 502);
  }

  // 上传附件
  const uploaded: { name: string; url?: string; id?: number }[] = [];
  const files = form.getAll('attachments').filter((f): f is File => f instanceof File && f.size > 0);
  for (const f of files) {
    try {
      const up = await uploadToStrapi(f, token);
      uploaded.push({ name: up?.name || f.name, url: up?.url, id: up?.id });
    } catch (e) {
      console.error('[submit] upload failed:', (e as Error).message);
    }
  }

  // 构建正文
  let content = '';
  if (sourceUrl) content += `来源链接：${sourceUrl}\n`;
  if (notes) content += `备注说明：${notes}\n`;
  if (uploaded.length) {
    content += `\n附件列表：\n`;
    uploaded.forEach((a, i) => {
      content += `${i + 1}. ${a.name}${a.url ? ' (' + a.url + ')' : ''}\n`;
    });
  }
  content = content || '（无额外说明）';

  try {
    const res = await fetch(
      `${STRAPI_URL}/content-manager/collection-types/api::message.message`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: title,
          content,
          author: nickname,
          email: email || '投稿@anonymous',
          category: `submission-${type}|pending_review|`,
          slug: `sub-${Date.now()}`,
        }),
      },
    );
    if (!res.ok) {
      const t = await res.text();
      console.error('[submit] create message failed:', res.status, t.slice(0, 200));
      return json({ error: '投稿记录创建失败，请稍后重试' }, 500);
    }
  } catch (e) {
    console.error('[submit] create message error:', (e as Error).message);
    return json({ error: '投稿记录创建失败，请稍后重试' }, 500);
  }

  // 邮件通知（SMTP_PASS 未配置则跳过）
  if (email && SMTP_PASS) {
    try {
      await getTransporter().sendMail({
        from: `"HSEr 站点投稿" <${SMTP_USER}>`,
        to: email,
        subject: `[投稿已接收] ${title}`,
        text: `您好 ${nickname}，\n\n您提交的「${subType}」《${title}》已成功接收，我们将审核后发布。\n\nHSEr.ren 团队`,
      });
    } catch (e) {
      console.error('[submit] email failed:', (e as Error).message);
    }
  }

  return json({
    success: true,
    message: '投稿成功！审核通过后将发布到对应栏目。',
    data: { type, status: 'pending_review', attachments: uploaded.length, emailSent: !!email },
  });
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
