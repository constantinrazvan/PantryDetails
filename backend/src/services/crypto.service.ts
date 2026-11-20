import crypto from "crypto";

export class CryptoService {
    private key: Buffer;

    constructor() {
        if (!process.env.ENCRYPTION_KEY) {
            throw new Error("ENCRYPTION_KEY is not set");
        }

        this.key = Buffer.from(process.env.ENCRYPTION_KEY, "base64");
        if (this.key.length !== 32) {
            throw new Error("ENCRYPTION_KEY must be 32 bytes");
        }
    }

    encrypt(data: Buffer): Buffer {
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv("aes-256-gcm", this.key, iv);
        const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
        const tag = cipher.getAuthTag();

        return Buffer.concat([Buffer.from([1]), iv, tag, encrypted]);
    }

    decrypt(data: Buffer): Buffer {
        const iv = data.subarray(1, 13);
        const tag = data.subarray(13, 29);
        const encrypted = data.subarray(29);

        const decipher = crypto.createDecipheriv("aes-256-gcm", this.key, iv);
        decipher.setAuthTag(tag);
        return Buffer.concat([decipher.update(encrypted), decipher.final()]);
    }

    encryptJson(value: any): string {
        const text = JSON.stringify(value);
        return this.encrypt(Buffer.from(text, "utf8")).toString("base64");
    }

    decryptJson(value: string): any {
        const text = this.decrypt(Buffer.from(value, "base64")).toString("utf8");
        return JSON.parse(text);
    }
}