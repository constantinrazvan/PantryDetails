import { AppError } from "../errors/app-error";
import { Item } from "../models/entities/item.entity";
import { ItemType } from "../models/enums/item-type.enum";
import { ItemRepository } from "../repositories/item.repository";
import { CryptoService } from "./crypto.service";
import { StorageService } from "./storage.service";

export interface NoteInput {
    title: string;
    body: string;
}

export interface CredentialInput {
    title: string;
    username: string;
    password: string;
    url: string | null;
    notes: string | null;
}

export interface FileInput {
    title: string;
    originalName: string;
    mimeType: string;
    buffer: Buffer;
}

export interface ItemUpdate {
    title?: string;
    body?: string;
    username?: string;
    password?: string;
    url?: string | null;
    notes?: string | null;
}

export class ItemService {
    private itemRepository = new ItemRepository();
    private crypto = new CryptoService();
    private storage = new StorageService();

    async list(folderId: number, search?: string) {
        const items = await this.itemRepository.listByFolder(folderId, search);

        const result = [];
        for (const item of items) {
            result.push(this.summary(item));
        }
        return result;
    }

    async createNote(folderId: number, userId: number, input: NoteInput) {
        const item = await this.itemRepository.create({
            folderId,
            type: ItemType.NOTE,
            title: input.title,
            encryptedData: this.crypto.encryptJson({ body: input.body }),
            createdBy: userId,
            updatedBy: userId,
        });
        return this.detail(item);
    }

    async createCredential(folderId: number, userId: number, input: CredentialInput) {
        const data = {
            username: input.username,
            password: input.password,
            url: input.url,
            notes: input.notes,
        };

        const item = await this.itemRepository.create({
            folderId,
            type: ItemType.CREDENTIAL,
            title: input.title,
            encryptedData: this.crypto.encryptJson(data),
            createdBy: userId,
            updatedBy: userId,
        });
        return this.detail(item);
    }

    async createFile(folderId: number, userId: number, input: FileInput) {
        const filePath = await this.storage.save(input.buffer);

        const item = await this.itemRepository.create({
            folderId,
            type: ItemType.FILE,
            title: input.title || input.originalName,
            filePath,
            originalName: input.originalName,
            mimeType: input.mimeType,
            size: input.buffer.length,
            createdBy: userId,
            updatedBy: userId,
        });
        return this.detail(item);
    }

    async get(folderId: number, itemId: number) {
        const item = await this.find(folderId, itemId);
        return this.detail(item);
    }

    async update(folderId: number, itemId: number, userId: number, input: ItemUpdate) {
        const item = await this.find(folderId, itemId);
        const changes: any = { updatedBy: userId };

        if (input.title !== undefined) {
            changes.title = input.title;
        }

        if (item.type === ItemType.NOTE && input.body !== undefined) {
            changes.encryptedData = this.crypto.encryptJson({ body: input.body });
        }

        if (item.type === ItemType.CREDENTIAL) {
            const data = this.crypto.decryptJson(item.encryptedData!);

            if (input.username !== undefined) data.username = input.username;
            if (input.password !== undefined) data.password = input.password;
            if (input.url !== undefined) data.url = input.url;
            if (input.notes !== undefined) data.notes = input.notes;

            changes.encryptedData = this.crypto.encryptJson(data);
        }

        await this.itemRepository.update(item.id, changes);
        return this.get(folderId, itemId);
    }

    async delete(folderId: number, itemId: number) {
        const item = await this.find(folderId, itemId);
        await this.itemRepository.delete(item.id);

        if (item.filePath) {
            await this.storage.remove(item.filePath);
        }
    }

    async reveal(folderId: number, itemId: number) {
        const item = await this.find(folderId, itemId);
        if (item.type !== ItemType.CREDENTIAL) {
            throw new AppError("Item is not a credential", 400);
        }

        const data = this.crypto.decryptJson(item.encryptedData!);
        return { password: data.password };
    }

    async download(folderId: number, itemId: number) {
        const item = await this.find(folderId, itemId);

        if (item.type === ItemType.FILE) {
            return {
                content: await this.storage.read(item.filePath!),
                fileName: item.originalName || item.title,
                mimeType: item.mimeType || "application/octet-stream",
            };
        }

        if (item.type === ItemType.NOTE) {
            const data = this.crypto.decryptJson(item.encryptedData!);
            return {
                content: Buffer.from(data.body, "utf8"),
                fileName: item.title + ".txt",
                mimeType: "text/plain",
            };
        }

        throw new AppError("Item cannot be downloaded", 400);
    }

    private async find(folderId: number, itemId: number) {
        const item = await this.itemRepository.findInFolder(folderId, itemId);
        if (!item) {
            throw new AppError("Item not found", 404);
        }
        return item;
    }

    private summary(item: Item) {
        const result: any = {
            id: item.id,
            type: item.type,
            title: item.title,
            originalName: item.originalName,
            mimeType: item.mimeType,
            size: item.size,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
        };

        if (item.type === ItemType.CREDENTIAL) {
            const data = this.crypto.decryptJson(item.encryptedData!);
            result.username = data.username;
            result.url = data.url;
        }

        return result;
    }

    private detail(item: Item) {
        const result = this.summary(item);

        if (item.type === ItemType.NOTE) {
            const data = this.crypto.decryptJson(item.encryptedData!);
            result.body = data.body;
        }

        if (item.type === ItemType.CREDENTIAL) {
            const data = this.crypto.decryptJson(item.encryptedData!);
            result.notes = data.notes;
        }

        return result;
    }
}
