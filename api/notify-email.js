/**
 * 邮件通知模块 - 投稿发布通知
 * 使用 QQ SMTP（已在 Vercel 环境变量中配置）
 */
import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.qq.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465');
const SMTP_USER = process.env.SMTP_USER || 'csdsq@qq.com';
const SMTP_PASS = process.env.SMTP_PASS;

let transporter = null;

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

/**
 * 发送"投稿已发布"通知邮件
 */
export async function sendPublishedNotification({ toEmail, toName, title, type, publishUrl }) {
  if (!toEmail || !SMTP_PASS) {
    console.log('Skipping email: no recipient or SMTP not configured');
    return null;
  }

  const typeLabel = {
    regulation: '法规文件',
    accident: '事故报告',
    standard: '国标地标',
    document: '资料文档',
    'ai-app': 'AI应用',
  }[type] || type;

  const mailOptions = {
    from: `"EHS经验分享" <${SMTP_USER}>`,
    to: toEmail,
    subject: `✅ 投稿已发布 - ${title}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f6f8;">
  <div style="max-width:600px;margin:24px auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

      <!-- Header -->
      <div style="background:linear-gradient(135deg,#1a73e8,#0d47a1);padding:32px 36px 28px;">
        <div style="font-size:40px;margin-bottom:8px;">✅</div>
        <h1 style="margin:0;color:#fff;font-size:20px;font-weight:600;">投稿已审核通过并发布</h1>
        <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">感谢你对 EHS经验分享 的贡献</p>
      </div>

      <!-- Body -->
      <div style="padding:28px 36px;">
        <p style="margin:0 0 16px;color:#444;font-size:15px;line-height:1.7;">
          ${toName ? '你好 ' + toName + '，' : '你好，'}
        </p>
        <p style="margin:0 0 20px;color:#444;font-size:15px;line-height:1.7;">
          你通过 hser.ren 投稿的以下内容已审核通过并发布到对应栏目：
        </p>

        <!-- Info Card -->
        <div style="background:#f0f4ff;border-radius:12px;padding:20px 24px;margin-bottom:24px;border:1px solid #dce8f8;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:6px 12px 6px 0;font-size:13px;color:#888;width:80px;vertical-align:top;">标题</td>
              <td style="padding:6px 0;font-size:15px;color:#333;font-weight:500;">${title}</td>
            </tr>
            <tr>
              <td style="padding:6px 12px 6px 0;font-size:13px;color:#888;vertical-align:top;">栏目</td>
              <td style="padding:6px 0;font-size:15px;color:#333;">
                <span style="display:inline-block;background:#e3f2fd;color:#1565c0;padding:2px 12px;border-radius:12px;font-size:13px;font-weight:500;">${typeLabel}</span>
              </td>
            </tr>
          </table>
        </div>

        <!-- CTA Button -->
        <a href="${publishUrl}" style="display:block;background:#1a73e8;color:#fff;text-decoration:none;padding:14px 24px;border-radius:10px;font-size:16px;font-weight:600;text-align:center;margin-bottom:20px;">查看已发布的内容 →</a>

        <p style="margin:0;color:#888;font-size:13px;line-height:1.6;">
          如果上方按钮无法点击，请复制以下链接到浏览器访问：<br>
          <span style="color:#1a73e8;word-break:break-all;">${publishUrl}</span>
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#f8f9fa;padding:20px 36px;border-top:1px solid #eee;">
        <p style="margin:0;font-size:12px;color:#aaa;line-height:1.6;">
          此邮件由 EHS经验分享 (hser.ren) 自动发送，请勿直接回复。<br>
          如有问题请联系：<a href="mailto:admin@hser.ren" style="color:#888;text-decoration:none;">admin@hser.ren</a>
        </p>
      </div>

    </div>
  </div>
</body>
</html>`,
  };

  try {
    const info = await getTransporter().sendMail(mailOptions);
    console.log(`Email sent to ${toEmail}: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`Email send failed to ${toEmail}:`, err.message);
    // Don't throw - email failure shouldn't block the main flow
    return null;
  }
}

/**
 * 发送"投稿已接收"通知邮件（需要人工审核时）
 */
export async function sendReceivedNotification({ toEmail, toName, title, type }) {
  if (!toEmail || !SMTP_PASS) return null;

  const typeLabel = {
    regulation: '法规文件',
    accident: '事故报告',
    standard: '国标地标',
  }[type] || type;

  const mailOptions = {
    from: `"EHS经验分享" <${SMTP_USER}>`,
    to: toEmail,
    subject: `📨 投稿已接收 - ${title}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f6f8;">
  <div style="max-width:600px;margin:24px auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <div style="background:linear-gradient(135deg,#f9a825,#f57f17);padding:32px 36px 28px;">
        <div style="font-size:40px;margin-bottom:8px;">📨</div>
        <h1 style="margin:0;color:#fff;font-size:20px;font-weight:600;">投稿已接收</h1>
        <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">管理员审核后将会发布</p>
      </div>
      <div style="padding:28px 36px;">
        <p style="margin:0 0 16px;color:#444;font-size:15px;line-height:1.7;">
          ${toName ? '你好 ' + toName + '，' : '你好，'}
        </p>
        <p style="margin:0 0 20px;color:#444;font-size:15px;line-height:1.7;">
          你的投稿已成功提交，以下是投稿摘要：
        </p>
        <div style="background:#fff8e1;border-radius:12px;padding:20px 24px;margin-bottom:24px;border:1px solid #ffe082;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:6px 12px 6px 0;font-size:13px;color:#888;width:80px;vertical-align:top;">标题</td><td style="padding:6px 0;font-size:15px;color:#333;font-weight:500;">${title}</td></tr>
            <tr><td style="padding:6px 12px 6px 0;font-size:13px;color:#888;vertical-align:top;">栏目</td><td style="padding:6px 0;font-size:15px;color:#333;"><span style="display:inline-block;background:#fff3e0;color:#e65100;padding:2px 12px;border-radius:12px;font-size:13px;font-weight:500;">${typeLabel}</span></td></tr>
          </table>
        </div>
        <p style="margin:0;color:#888;font-size:13px;line-height:1.6;">
          管理员审核通过后，你将收到本邮件地址的通知。<br>
          感谢你的贡献！
        </p>
      </div>
      <div style="background:#f8f9fa;padding:20px 36px;border-top:1px solid #eee;">
        <p style="margin:0;font-size:12px;color:#aaa;line-height:1.6;">
          此邮件由 EHS经验分享 (hser.ren) 自动发送，请勿直接回复。
        </p>
      </div>
    </div>
  </div>
</body>
</html>`,
  };

  try {
    const info = await getTransporter().sendMail(mailOptions);
    console.log(`Received notification sent to ${toEmail}: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`Received notification failed to ${toEmail}:`, err.message);
    return null;
  }
}
