import nodemailer from 'nodemailer';

const SMTP_HOST = 'smtp.qq.com';
const SMTP_PORT = 465;
const SMTP_USER = process.env.SMTP_USER || 'csdsq@qq.com';
const SMTP_PASS = process.env.SMTP_PASS;
const ADMIN_KEY = process.env.ADMIN_KEY || 'ehs2026';

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: true,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { adminKey, toEmail, toName, messageTitle, replyContent, messageUrl } = req.body;

  if (adminKey !== ADMIN_KEY) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  if (!toEmail || !messageTitle || !replyContent) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const mailOptions = {
      from: `"EHS信息站" <${SMTP_USER}>`,
      to: toEmail,
      subject: `你的留言收到了管理员回复 - ${messageTitle}`,
      html: `
        <div style="max-width:600px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;padding:20px;">
          <div style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
            <div style="background:linear-gradient(135deg,#2a9d8f,#264653);padding:24px 32px;">
              <h1 style="margin:0;color:#fff;font-size:20px;font-weight:600;">EHS信息站 · 留言回复通知</h1>
            </div>
            <div style="padding:28px 32px;">
              <p style="margin:0 0 8px;color:#666;font-size:14px;">你好${toName ? '，' + toName : ''}：</p>
              <p style="margin:0 0 20px;color:#333;font-size:15px;line-height:1.6;">你在 EHS信息站 留言板发表的留言收到了管理员回复。</p>
              <div style="background:#f8f9fa;border-radius:8px;padding:16px 20px;margin-bottom:20px;">
                <div style="font-size:13px;color:#888;margin-bottom:6px;">原留言标题</div>
                <div style="font-size:15px;color:#333;font-weight:500;">${messageTitle}</div>
              </div>
              <div style="background:#e8f5f3;border-radius:8px;padding:16px 20px;margin-bottom:24px;border-left:4px solid #2a9d8f;">
                <div style="font-size:13px;color:#2a9d8f;margin-bottom:6px;font-weight:500;">🛡 管理员回复</div>
                <div style="font-size:15px;color:#333;line-height:1.7;">${replyContent}</div>
              </div>
              <a href="${messageUrl}" style="display:inline-block;background:#2a9d8f;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:500;">查看详情</a>
            </div>
            <div style="background:#f8f9fa;padding:16px 32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#999;">此邮件由 EHS信息站 (hser.ren) 自动发送，请勿直接回复。</p>
            </div>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
}
