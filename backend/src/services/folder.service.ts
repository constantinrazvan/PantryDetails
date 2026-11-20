import { AppError } from "../errors/app-error";
import { AuthUser, MemberPermissions } from "../types/express";
import { getPermissions } from "../utils/member-permissions";
import { Folder } from "../models/entities/folder.entity";
import { FolderPermission } from "../models/enums/folder-permission.enum";
import { ItemType } from "../models/enums/item-type.enum";
import { UserRole } from "../models/enums/user-role.enum";
import { FolderRepository } from "../repositories/folder.repository";
import { FolderAccessRepository } from "../repositories/folder-access.repository";
import { ItemRepository } from "../repositories/item.repository";
import { UserRepository } from "../repositories/user.repository";
import { StorageService } from "./storage.service";

export class FolderService {
    private folderRepository = new FolderRepository();
    private folderAccessRepository = new FolderAccessRepository();
    private itemRepository = new ItemRepository();
    private userRepository = new UserRepository();
    private storage = new StorageService();

    async list(user: AuthUser) {
        const permissions = await getPermissions(user);
        if (!permissions.canView) {
            return [];
        }

        let folders: Folder[];
        if (user.role === UserRole.ADMIN) {
            folders = await this.folderRepository.findAll();
        } else {
            folders = await this.folderRepository.findAllForUser(user.id);
        }

        const result = [];
        for (const folder of folders) {
            result.push(this.withPermissions(folder, permissions));
        }
        return result;
    }

    withPermissions(folder: Folder, permissions: MemberPermissions) {
        let permission = FolderPermission.READ;
        if (permissions.canEdit) {
            permission = FolderPermission.WRITE;
        }

        return {
            ...folder,
            permission: permission,
            canEdit: permissions.canEdit,
            canDelete: permissions.canDelete,
        };
    }

    create(userId: number, name: string, description: string | null) {
        return this.folderRepository.create({ name, description, createdBy: userId });
    }

    async update(folderId: number, data: { name?: string; description?: string | null }) {
        await this.folderRepository.update(folderId, data);
        return this.folderRepository.findById(folderId);
    }

    async delete(folderId: number) {
        const items = await this.itemRepository.listByFolder(folderId);
        await this.folderRepository.delete(folderId);

        for (const item of items) {
            if (item.type === ItemType.FILE && item.filePath) {
                await this.storage.remove(item.filePath);
            }
        }
    }

    async listAccess(folderId: number) {
        const rows = await this.folderAccessRepository.listForFolder(folderId);

        const result = [];
        for (const row of rows) {
            result.push({
                userId: row.userId,
                firstName: row.user.firstName,
                lastName: row.user.lastName,
                email: row.user.email,
                role: row.user.role,
                permission: row.permission,
            });
        }
        return result;
    }

    async grantAccess(folderId: number, userId: number, permission: FolderPermission) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new AppError("User not found", 404);
        }
        await this.folderAccessRepository.save(folderId, userId, permission);
    }

    async revokeAccess(folderId: number, userId: number) {
        await this.folderAccessRepository.remove(folderId, userId);
    }
}
