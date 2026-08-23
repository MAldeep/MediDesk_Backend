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
  static async sendSetPasswordEmail(
    toEmail: string,
    userName: string,
    adminName: string,
    rawToken: string,
  ): Promise<void> {
    const inviteUrl = `${env.CLIENT_URL}/set-password?token=${rawToken}`;
    const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; text-align: right; padding: 25px; background-color: #f8fafc; border-radius: 8px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        
        <h2 style="color: #0284c7; margin-bottom: 20px;">دعوة للانضمام إلى فريق MediDesk 🏥</h2>
        
        <p style="font-size: 16px; color: #334155; line-height: 1.6;">
          أهلاً بك <strong>${userName}</strong>،
        </p>
        
        <p style="font-size: 15px; color: #475569; line-height: 1.6;">
          تمت دعوتك من قبل إدارة العيادة للانضمام إلى المنصة. يرجى الضغط على الزر أدناه لضبط كلمة السر الخاصة بحسابك وتفعيله:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteUrl}" 
            style="background-color: #0284c7; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
            تعيين كلمة السر
          </a>
        </div>
        
        <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
          ⚠️ هذا الرابط صالحة لمدة <strong>24 ساعة فقط</strong>. إذا لم تكن تتوقع هذه الدعوة، يمكنك إهمال هذا الإيميل وسيتم إلغاؤه تلقائياً.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
        
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">
          إذا كان الزر لا يعمل، يمكنك نسخ الرابط التالي ولصقه في المتصفح:<br/>
          <a href="${inviteUrl}" style="color: #0284c7;">${inviteUrl}</a>
        </p>
        
      </div>
    </div>
  `;
    await this.send({
      to: toEmail,
      subject: `Join ${adminName} in Now`,
      html: html,
    });
  }
  static async sendResetPasswordEmail(
    toEmail: string,
    userName: string,
    rawToken: string,
  ): Promise<void> {
    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${rawToken}`;
    const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; text-align: right; padding: 25px; background-color: #f8fafc; border-radius: 8px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #0284c7; margin-bottom: 20px;">إعادة ضبط كلمة السر 🔐</h2>
        
        <p style="font-size: 16px; color: #334155; line-height: 1.6;">
          أهلاً بك <strong>${userName}</strong>،
        </p>
        
        <p style="font-size: 15px; color: #475569; line-height: 1.6;">
          لقد تلقينا طلباً لإعادة ضبط كلمة السر الخاصة بحسابك على منصة MediDesk. اضغط على الزر أدناه لإعادة الضبط:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
            style="background-color: #0284c7; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
            إعادة ضبط كلمة السر
          </a>
        </div>
        
        <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
          ⚠️ هذا الرابط صالحة لمدة <strong>10 دقائق فقط</strong>. إذا لم تطلب إعادة الضبط، يمكنك إهمال هذا الإيميل ولن يتغير شيء في حسابك.
        </p>
      </div>
    </div>
  `;
    await this.send({
      to: toEmail,
      subject: "Reset Your Password -- MediDesk",
      html,
    });
  }
}
