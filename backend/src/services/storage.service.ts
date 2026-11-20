import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { CryptoService } from "./crypto.service";

export class StorageService {
    private folder = path.resolve(process.env.STORAGE_PATH ?? "./storage");
    private crypto = new CryptoService();

    async save(content: Buffer): Promise<string> {
        await fs.mkdir(this.folder, { recursive: true });

        const name = crypto.randomUUID();
        await fs.writeFile(path.join(this.folder, name), this.crypto.encrypt(content));
        return name;
    }

    async read(name: string): Promise<Buffer> {
        const content = await fs.readFile(path.join(this.folder, path.basename(name)));
        return this.crypto.decrypt(content);
    }

    async remove(name: string) {
        await fs.rm(path.join(this.folder, path.basename(name)), { force: true });
    }
}
