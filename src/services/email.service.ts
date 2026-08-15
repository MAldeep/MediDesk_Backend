import nodemailer from "nodemailer";
import { env } from "../config/env.js";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: env.SMTP_Host,
    port: env.SMTP_Port,
    auth: {
      user: env.SMTP_Username,
      pass: env.SMTP_Password,
    },
  });
  static async sendSetPasswordEmail(email: string, token: string) {
    const setPasswordUrl = `${env.CLIENT_URL}/set-password?token=${token}`;
    const html = `
    <h1>Welcome to MediDesk</h1>
    <p>Please click the link below to set your password:</p>
    <a href="${setPasswordUrl}">Set My Password</a>
  `;
    await this.transporter.sendMail({
      from: `MediDesk <"noreply@medidesk.com">`,
      to: email,
      subject: "Set Your Password - MediDesk",
      html: html,
    });
  }
  static async sendResetPasswordEmail(email: string, token: string) {
    const resetPasswordUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;
    const html = `
    <h1>Welcome to MediDesk</h1>
    <p>Please click the link below to reset your password:</p>
    <a href="${resetPasswordUrl}">Reset My Password</a>
  `;
    await this.transporter.sendMail({
      from: `MediDesk <"noreply@medidesk.com">`,
      to: email,
      subject: "Reset Password -- MediDesk",
      html: html,
    });
  }
}
