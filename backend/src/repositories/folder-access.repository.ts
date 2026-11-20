import { AppDataSource } from "../config/data-source";
import { FolderAccess } from "../models/entities/folder-access.entity";
import { FolderPermission } from "../models/enums/folder-permission.enum";

export class FolderAccessRepository {
    private get repository() {
        return AppDataSource.getRepository(FolderAccess);
    }

    find(folderId: number, userId: number) {
        return this.repository.findOneBy({ folderId, userId });
    }

    findForUser(userId: number) {
        return this.repository.findBy({ userId });
    }

    listForFolder(folderId: number) {
        return this.repository.find({
            where: { folderId },
            relations: { user: true },
            order: { createdAt: "ASC" },
        });
    }

    async save(folderId: number, userId: number, permission: FolderPermission) {
        const existing = await this.find(folderId, userId);
        if (existing) {
            existing.permission = permission;
            await this.repository.save(existing);
        } else {
            await this.repository.save(this.repository.create({ folderId, userId, permission }));
        }
    }

    async remove(folderId: number, userId: number) {
        await this.repository.delete({ folderId, userId });
    }
}
