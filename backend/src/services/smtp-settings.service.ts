import { AppSettingRepository } from "../repositories/app-setting.repository";
import { CryptoService } from "./crypto.service";

export interface SmtpConfig {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
    from: string;
}

export interface SmtpSettingsInput {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    from: string;
    password?: string;
}

const DEFAULT_FROM = "PantryDetails <no-reply@pantrydetails.local>";

export class SmtpSettingsService {
    private settings = new AppSettingRepository();
    private crypto = new CryptoService();

    async getConfig(): Promise<SmtpConfig | null> {
        const host = await this.settings.get("smtp.host");

        if (host) {
            const port = await this.settings.get("smtp.port");
            const secure = await this.settings.get("smtp.secure");
            const user = await this.settings.get("smtp.user");
            const password = await this.settings.get("smtp.password");
            const from = await this.settings.get("smtp.from");

            return {
                host: host,
                port: Number(port) || 587,
                secure: secure === "true",
                user: user || "",
                password: password ? this.crypto.decryptJson(password) : "",
                from: from || DEFAULT_FROM,
            };
        }

        if (process.env.SMTP_HOST) {
            const port = Number(process.env.SMTP_PORT) || 587;
            return {
                host: process.env.SMTP_HOST,
                port: port,
                secure: port === 465,
                user: process.env.SMTP_USER || "",
                password: process.env.SMTP_PASSWORD || "",
                from: process.env.MAIL_FROM || DEFAULT_FROM,
            };
        }

        return null;
    }

    async getView() {
        const config = await this.getConfig();

        if (!config) {
            return { host: "", port: 587, secure: false, user: "", from: DEFAULT_FROM, hasPassword: false, source: "none" };
        }

        const hostInDatabase = await this.settings.get("smtp.host");

        return {
            host: config.host,
            port: config.port,
            secure: config.secure,
            user: config.user,
            from: config.from,
            hasPassword: config.password !== "",
            source: hostInDatabase ? "database" : "env",
        };
    }

    async update(input: SmtpSettingsInput) {
        await this.settings.set("smtp.host", input.host);
        await this.settings.set("smtp.port", String(input.port));
        await this.settings.set("smtp.secure", String(input.secure));
        await this.settings.set("smtp.user", input.user);
        await this.settings.set("smtp.from", input.from || DEFAULT_FROM);

        if (input.password !== undefined) {
            if (input.password) {
                await this.settings.set("smtp.password", this.crypto.encryptJson(input.password));
            } else {
                await this.settings.set("smtp.password", null);
            }
        }

        return this.getView();
    }
}
