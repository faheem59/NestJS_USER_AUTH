import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import * as fs from "fs";
import * as path from "path";
import {
  ResetPasswordResponse,
  VerifyEmailResponse,
} from "../utils/success-response";
import { SUCCESS_MESSAGES } from "../utils/success-messges";
import { ERROR_MESSAGES } from "../utils/error-messages";
import { Common } from "../enum/common-enum";

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  // templates for better UI
  private async loadTemplate(
    templateName: string,
    replacements: Record<string, string>,
  ): Promise<string> {
    const templatePath = path.join(
      __dirname,
      "../mail/email-templates",
      `${templateName}.html`,
    );
    let template = fs.readFileSync(templatePath, "utf-8");

    for (const key in replacements) {
      template = template.replace(
        new RegExp(`{{${key}}}`, "g"),
        replacements[key],
      );
    }

    return template;
  }

  // send a verification mail to user
  async sendEmail(email: string): Promise<VerifyEmailResponse> {
    const verificationLink = `http://localhost:3000/verify?email=${encodeURIComponent(email)}`;

    const htmlContent = await this.loadTemplate("verification-email", {
      verificationLink,
    });

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: Common.VERIFICATION_SUBJECT,
        html: htmlContent,
      });
      return {
        message: SUCCESS_MESSAGES.EMAIL_VERFIED,
      };
    } catch (error) {
      throw new Error(ERROR_MESSAGES.FAILED_TO_SEND_EMAIL || error.message);
    }
  }

  // send a reset mail to user to update a new password

  async sendPasswordResetEmail(
    email: string,
    token: string,
  ): Promise<ResetPasswordResponse> {
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;

    const htmlContent = await this.loadTemplate("password-reset-email", {
      resetLink,
    });

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: Common.RESET_PASSWORD_SUBJECT,
        html: htmlContent,
      });
      return {
        message: SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS,
      };
    } catch (error) {
      throw new Error(
        ERROR_MESSAGES.FAILED_TO_SEND_RESET_MAIL || error.message,
      );
    }
  }
}
