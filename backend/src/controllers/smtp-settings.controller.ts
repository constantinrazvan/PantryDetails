import { Request, Response } from "express";
import { SmtpSettingsService } from "../services/smtp-settings.service";
import { MailService } from "../services/mail.service";
import { handleError } from "../utils/handle-error";

export class SmtpSettingsController {
    private smtpSettings = new SmtpSettingsService();
    private mailService = new MailService();

    get = async (request: Request, response: Response) => {
        try {
            const settings = await this.smtpSettings.getView();
            return response.status(200).json({ success: true, data: settings });
        } catch (error) {
            return handleError(response, error);
        }
    };

    update = async (request: Request, response: Response) => {
        const { host, port, secure, user, from, password } = request.body || {};

        if (typeof host !== "string" || !host.trim() || host.length > 255) {
            return response.status(400).json({ success: false, message: "Host is required" });
        }
        if (!Number.isInteger(port) || port < 1 || port > 65535) {
            return response.status(400).json({ success: false, message: "Port should be between 1 and 65535" });
        }
        if (typeof secure !== "boolean") {
            return response.status(400).json({ success: false, message: "Secure should be true or false" });
        }
        if (user !== undefined && typeof user !== "string") {
            return response.status(400).json({ success: false, message: "User should be text" });
        }
        if (from !== undefined && typeof from !== "string") {
            return response.status(400).json({ success: false, message: "From should be text" });
        }
        if (password !== undefined && typeof password !== "string") {
            return response.status(400).json({ success: false, message: "Password should be text" });
        }

        try {
            const settings = await this.smtpSettings.update({
                host: host.trim(),
                port: port,
                secure: secure,
                user: (user || "").trim(),
                from: (from || "").trim(),
                password: password,
            });
            return response.status(200).json({ success: true, data: settings });
        } catch (error) {
            return handleError(response, error);
        }
    };

    test = async (request: Request, response: Response) => {
        try {
            const config = await this.smtpSettings.getConfig();
            if (!config) {
                return response.status(400).json({ success: false, message: "SMTP is not configured" });
            }

            const email = request.user!.email;
            await this.mailService.sendWith(config, email, "SMTP test - PantryDetails", "SMTP is configured correctly.");
            return response.status(200).json({ success: true, message: "Test email sent to " + email });
        } catch (error: any) {
            return response.status(502).json({ success: false, message: "Sending failed: " + error.message });
        }
    };
}
