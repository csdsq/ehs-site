import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

/**
 * 站点反馈接口 —— Astro 服务端端点（ECS Node SSR 下运行）
 * 取代原 Vercel Serverless Function（api/feedback.js），因为 ECS 迁移后 Vercel 函数不再执行。
 * 路由为 /feedback（非 /api/feedback，因 /api/* 仍被 Vercel 旧规则拦截）。
 *
 * 前端 Layout.astro 的反馈面板 POST 到这里，字段：
 *   { type, detail, pageUrl, pageTitle }
 * 返回：
 *   { success: true, emailSent, strapiSaved }
 *
 * 处理：
 *   1) 发邮件给管理员 admin@hser.ren（QQ SMTP，环境变量配置）
 *   2) 存一份到 Strapi 的 message 集合（category 前缀 feedback|类型|pending，便于人工跟踪）
 */
const STRAPI_URL = process.env.STRAPI_URL || 'http://127.0.0.1:1337';
const ADMIN_EMAIL = process.env.STRAPI_ADMIN_EMAIL || 'admin@hser.ren';
const ADMIN_PASSWORD = process.env.STRAPI_ADMIN_PASSWORD || 'StrapiAdmin2026';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.qq.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465', 10);
const SMTP_USER = process.env.SMTP_USER || 'csdsq@qq.com';
const SMTP_PASS = process.env.SMTP_PASS;

const TYPE_LABELS: Record<string, string> = {
  link_broken: '链接失效',
  content_error: '内容错误',
  wrong_category: '分类/标签不对',
  duplicate: '重复/多余',
  other: '其他',
};

export const prerender = false;

// ---- 邮件发送（复用 nodemailer，QQ SMTP） ----
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

async function sendFeedbackNotification({
  typeLabel,
  detail,
  pageUrl,
  pageTitle,
}: {
  typeLabel: string;
  detail: string;
  pageUrl: string;
  pageTitle: string;
}) {
  if (!SMTP_PASS) {
    console.log('[feedback] skip email: SMTP_PASS not configured');
    return null;
  }
  const mailOptions = {
    from: `"HSEr 站点反馈" <${SMTP_USER}>`,
    to: 'admin@hser.ren',
    subject: `[站点反馈] ${typeLabel}`,
    html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f6f8;">
  <div style="max-width:600px;margin:24px auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <div style="background:linear-gradient(135deg,#dc2626,#b91c1c);padding:28px 36px 24px;">
        <div style="font-size:34px;margin-bottom:6px;">⚠️</div>
        <h1 style="margin:0;color:#fff;font-size:19px;font-weight:600;">收到一条站点反馈</h1>
        <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">HSEr.ren 访客提交，请人工核验处理</p>
      </div>
      <div style="padding:28px 36px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 12px 8px 0;font-size:13px;color:#888;width:88px;vertical-align:top;">问题类型</td>
            <td style="padding:8px 0;font-size:15px;color:#333;font-weight:600;"><span style="display:inline-block;background:#fee2e2;color:#b91c1c;padding:3px 14px;border-radius:12px;font-size:14px;">${typeLabel}</span></td></tr>
          <tr><td style="padding:8px 12px 8px 0;font-size:13px;color:#888;vertical-align:top;">页面标题</td><td style="padding:8px 0;font-size:14px;color:#333;">${pageTitle || '（无）'}</td></tr>
          <tr><td style="padding:8px 12px 8px 0;font-size:13px;color:#888;vertical-align:top;">页面链接</td><td style="padding:8px 0;font-size:14px;color:#1a73e8;word-break:break-all;"><a href="${pageUrl}" style="color:#1a73e8;text-decoration:none;">${pageUrl || '（无）'}</a></td></tr>
          <tr><td style="padding:8px 12px 8px 0;font-size:13px;color:#888;vertical-align:top;">补充说明</td><td style="padding:8px 0;font-size:14px;color:#333;white-space:pre-wrap;">${detail || '（无）'}</td></tr>
        </table>
        <p style="margin:20px 0 0;font-size:12px;color:#aaa;">提交时间：${new Date().toLocaleString('zh-CN')}</p>
      </div>
      <div style="background:#f8f9fa;padding:18px 36px;border-top:1px solid #eee;">
        <p style="margin:0;font-size:12px;color:#aaa;line-height:1.6;">此邮件由 HSEr.ren 站点反馈功能自动发送。</p>
      </div>
    </div>
  </div>
</body></html>`,
  };
  try {
    const info = await getTransporter().sendMail(mailOptions);
    console.log('[feedback] email sent:', info.messageId);
    return info;
  } catch (err) {
    console.error('[feedback] email failed:', (err as Error).message);
    return null;
  }
}

// ---- Strapi 存储（复用 message 集合，admin 登录后写 content-manager） ----
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
  const data = await res.json();
  return data.data.token;
}

async function saveToStrapi({
  type,
  label,
  detail,
  pageUrl,
  pageTitle,
}: {
  type: string;
  label: string;
  detail: string;
  pageUrl: string;
  pageTitle: string;
}): Promise<boolean> {
  const token = await loginStrapi();
  const content = [
    `反馈类型：${label}`,
    `页面标题：${pageTitle || '（无）'}`,
    `页面链接：${pageUrl || '（无）'}`,
    `补充说明：${detail || '（无）'}`,
    `提交时间：${new Date().toLocaleString('zh-CN')}`,
  ].join('\n');

  const res = await fetch(
    `${STRAPI_URL}/content-manager/collection-types/api::message.message`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: `[站点反馈] ${label}`,
        content,
        author: '站点访客',
        email: 'feedback@hser.ren',
        category: `feedback|${type}|pending`,
        slug: `fb-${Date.now()}`,
      }),
    },
  );
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`创建记录失败 ${res.status}: ${t.slice(0, 200)}`);
  }
  return true;
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

  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: '请求体不是合法 JSON' }, 400);
  }

  const { type, detail, pageUrl, pageTitle } = body || {};
  if (!type || !TYPE_LABELS[type]) {
    return json({ error: '请选择有效的反馈类型' }, 400);
  }
  const label = TYPE_LABELS[type];

  let emailSent = false;
  try {
    const info = await sendFeedbackNotification({
      typeLabel: label,
      detail: detail || '',
      pageUrl: pageUrl || '',
      pageTitle: pageTitle || '',
    });
    emailSent = !!info;
  } catch (e) {
    console.error('[feedback] email error:', (e as Error).message);
  }

  let strapiSaved = false;
  try {
    strapiSaved = await saveToStrapi({
      type,
      label,
      detail: detail || '',
      pageUrl: pageUrl || '',
      pageTitle: pageTitle || '',
    });
  } catch (e) {
    console.error('[feedback] strapi error:', (e as Error).message);
  }

  return json({ success: true, emailSent, strapiSaved });
};

// CORS 预检（同源下通常不需要，但保留以兼容跨域调试）
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
