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
}
