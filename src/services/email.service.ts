import { transporter } from "../config/email.config.js";
import { env } from "../config/env.js";

interface IEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}
export class EmailServices {
  private static async send(options: IEmailOptions): Promise<void> {
    const mailOptions = {
      from: `Medidesk - Medical Care : ${env.SMTP_Username}`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };
    await transporter.sendMail(mailOptions);
  }
  static async sendWelcomeEmail(
    toEmail: string,
    userName: string,
  ): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; padding: 20px; background-color: #f9f9f9;">
        <h2 style="color: #0284c7;">أهلاً بك في منصة MediDesk يا دكتور ${userName}! 👋</h2>
        <p style="font-size: 16px; color: #333;">تم إنشاء حسابك بنجاح في النظام.</p>
        <p style="font-size: 14px; color: #666;">يمكنك الآن البدء في إدارة المرضى والمواعيد بسهولة.</p>
      </div>
    `;
    await this.send({
      to: toEmail,
      subject: "Welcome to MediDesk",
      html: html,
    });
  }
}
