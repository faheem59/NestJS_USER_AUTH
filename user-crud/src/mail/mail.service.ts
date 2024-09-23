import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(email: string): Promise<string> {
    const verificationLink = `http://localhost:3000/verify?email=${encodeURIComponent(email)}`;
    try {
      await this.mailerService.sendMail({
        to: email,
        from: "coursebundler@edu.com",
        subject: "Test email from NestJS!",
        text: `This is a test email. Please verify your email by clicking on the link: ${verificationLink}`,
      });
      return "Email sent";
    } catch (error) {
      console.error("Error sending email:", error);
      throw new Error("Failed to send email");
    }
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<string> {
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;
    try {
      const sent = await this.mailerService.sendMail({
        to: email,
        subject: "Password Reset Request",
        text: `To reset your password, click the following link: ${resetLink}`,
      });
      console.log(`Password reset email sent to: ${email}`, sent);
      return "Password reset email sent";
    } catch (error) {
      console.error("Error sending email:", error);
      throw new Error("Failed to send password reset email");
    }
  }
}
