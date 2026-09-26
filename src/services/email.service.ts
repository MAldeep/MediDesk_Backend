import { env } from "../config/env.js";

interface IEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailServices {
  private static async send(options: IEmailOptions) {
    try {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "api-key": env.BREVO_API_KEY || process.env.BREVO_API_KEY || "",
        },
        body: JSON.stringify({
          sender: {
            name: env.SENDER_NAME || "MediDesk - Medical Care",
            email: env.SENDER_EMAIL || "",
          },
          to: [{ email: options.to }],
          subject: options.subject,
          htmlContent: options.html,
          textContent: options.text,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error("Brevo API Error: " + JSON.stringify(errorData));
      }

      const data = await response.json();
      console.log("Email sent successfully via Brevo API:", data);
    } catch (error) {
      console.error("Error sending email via Brevo:", error);
      throw new Error("Failed to send email");
    }
  }

  static async sendWelcomeEmail(toEmail: string, userName: string) {
    const html = [
      '\x3Cdiv style="font-family: Arial, sans-serif; direction: rtl; text-align: right; padding: 20px; background-color: #f9f9f9;"\x3E',
      '  \x3Ch2 style="color: #0284c7;"\x3Eأهلاً بك في منصة MediDesk يا دكتور ' +
        userName +
        "! 👋\x3C/h2\x3E",
      '  \x3Cp style="font-size: 16px; color: #333;"\x3Eتم إنشاء حسابك بنجاح في النظام.\x3C/p\x3E',
      '  \x3Cp style="font-size: 14px; color: #666;"\x3Eيمكنك الآن البدء في إدارة المرضى والمواعيد بسهولة.\x3C/p\x3E',
      "\x3C/div\x3E",
    ].join("\n");

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
  ) {
    const inviteUrl = env.CLIENT_URL + "/set-password?token=" + rawToken;
    const html = [
      "\x3Cdiv style=\"font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; text-align: right; padding: 25px; background-color: #f8fafc; border-radius: 8px;\"\x3E",
      '  \x3Cdiv style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"\x3E',
      '    \x3Ch2 style="color: #0284c7; margin-bottom: 20px;"\x3Eدعوة للانضمام إلى فريق MediDesk 🏥\x3C/h2\x3E',
      '    \x3Cp style="font-size: 16px; color: #334155; line-height: 1.6;"\x3Eأهلاً بك \x3Cstrong\x3E' +
        userName +
        "\x3C/strong\x3E،\x3C/p\x3E",
      '    \x3Cp style="font-size: 15px; color: #475569; line-height: 1.6;"\x3Eتمت دعوتك من قبل إدارة العيادة للانضمام إلى المنصة. يرجى الضغط على الزر أدناه لضبط كلمة السر الخاصة بحسابك وتفعيله:\x3C/p\x3E',
      '    \x3Cdiv style="text-align: center; margin: 30px 0;"\x3E',
      '      \x3Ca href="' +
        inviteUrl +
        '" style="background-color: #0284c7; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;"\x3Eتعيين كلمة السر\x3C/a\x3E',
      "    \x3C/div\x3E",
      '    \x3Cp style="font-size: 13px; color: #64748b; line-height: 1.5;"\x3E⚠️ هذا الرابط صالحة لمدة \x3Cstrong\x3E24 ساعة فقط\x3C/strong\x3E. إذا لم تكن تتوقع هذه الدعوة، يمكنك إهمال هذا الإيميل وسيتم إلغاؤه تلقائياً.\x3C/p\x3E',
      '    \x3Chr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;" /\x3E',
      '    \x3Cp style="font-size: 12px; color: #94a3b8; text-align: center;"\x3Eإذا كان الزر لا يعمل، يمكنك نسخ الرابط التالي ولصقه في المتصفح:\x3Cbr/\x3E\x3Ca href="' +
        inviteUrl +
        '" style="color: #0284c7;"\x3E' +
        inviteUrl +
        "\x3C/a\x3E\x3C/p\x3E",
      "  \x3C/div\x3E",
      "\x3C/div\x3E",
    ].join("\n");

    await this.send({
      to: toEmail,
      subject: "Join " + adminName + " in Now",
      html: html,
    });
  }

  static async sendResetPasswordEmail(
    toEmail: string,
    userName: string,
    rawToken: string,
  ) {
    const resetUrl = env.CLIENT_URL + "/reset-password?token=" + rawToken;
    const html = [
      "\x3Cdiv style=\"font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; text-align: right; padding: 25px; background-color: #f8fafc; border-radius: 8px;\"\x3E",
      '  \x3Cdiv style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"\x3E',
      '    \x3Ch2 style="color: #0284c7; margin-bottom: 20px;"\x3Eإعادة ضبط كلمة السر 🔐\x3C/h2\x3E',
      '    \x3Cp style="font-size: 16px; color: #334155; line-height: 1.6;"\x3Eأهلاً بك \x3Cstrong\x3E' +
        userName +
        "\x3C/strong\x3E،\x3C/p\x3E",
      '    \x3Cp style="font-size: 15px; color: #475569; line-height: 1.6;"\x3Eلقد تلقينا طلباً لإعادة ضبط كلمة السر الخاصة بحسابك على منصة MediDesk. اضغط على الزر أدناه لإعادة الضبط:\x3C/p\x3E',
      '    \x3Cdiv style="text-align: center; margin: 30px 0;"\x3E',
      '      \x3Ca href="' +
        resetUrl +
        '" style="background-color: #0284c7; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;"\x3Eإعادة ضبط كلمة السر\x3C/a\x3E',
      "    \x3C/div\x3E",
      '    \x3Cp style="font-size: 13px; color: #64748b; line-height: 1.5;"\x3E⚠️ هذا الرابط صالحة لمدة \x3Cstrong\x3E10 دقائق فقط\x3C/strong\x3E. إذا لم تطلب إعادة الضبط، يمكنك إهمال هذا الإيميل ولن يتغير شيء في حسابك.\x3C/p\x3E',
      "  \x3C/div\x3E",
      "\x3C/div\x3E",
    ].join("\n");

    await this.send({
      to: toEmail,
      subject: "Reset Your Password -- MediDesk",
      html: html,
    });
  }
}
