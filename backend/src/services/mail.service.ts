import nodemailer from "nodemailer";
import { SmtpConfig, SmtpSettingsService } from "./smtp-settings.service";

export class MailService {
    private smtpSettings = new SmtpSettingsService();

    async send(to: string, subject: string, text: string) {
        const config = await this.smtpSettings.getConfig();

        if (!config) {
            if (process.env.NODE_ENV === "production") {
                throw new Error("SMTP is not configured");
            }

            // without SMTP, in development the email is printed in the console
            console.log("[mail] To: " + to);
            console.log("[mail] Subject: " + subject);
            console.log(text);
            return;
        }

        await this.sendWith(config, to, subject, text);
    }

    async sendWith(config: SmtpConfig, to: string, subject: string, text: string) {
        let auth = undefined;
        if (config.user) {
            auth = { user: config.user, pass: config.password };
        }

        const transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: config.secure,
            auth: auth,
        });

        await transporter.sendMail({ from: config.from, to, subject, text });
    }
}
