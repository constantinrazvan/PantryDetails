import { Folder } from "../models/entities/folder.entity";
import { User } from "../models/entities/user.entity";
import { ItemType } from "../models/enums/item-type.enum";
import { UserRole } from "../models/enums/user-role.enum";
import { FolderRepository } from "../repositories/folder.repository";
import { ItemRepository } from "../repositories/item.repository";
import { UserRepository } from "../repositories/user.repository";
import { AuthUser } from "../types/express";
import { getPermissions } from "../utils/member-permissions";

function getExtension(fileName: string | null) {
    if (!fileName || !fileName.includes(".")) {
        return "altele";
    }
    return fileName.split(".").pop()!.toLowerCase();
}

export class StatsService {
    private folderRepository = new FolderRepository();
    private itemRepository = new ItemRepository();
    private userRepository = new UserRepository();

    async overview(authUser: AuthUser) {
        const isAdmin = authUser.role === UserRole.ADMIN;

        let folders: Folder[] = [];
        const permissions = await getPermissions(authUser);
        if (isAdmin) {
            folders = await this.folderRepository.findAll();
        } else if (permissions.canView) {
            folders = await this.folderRepository.findAllForUser(authUser.id);
        }

        const folderIds = [];
        for (const folder of folders) {
            folderIds.push(folder.id);
        }

        const items = await this.itemRepository.listByFolders(folderIds);

        let users: User[] = [];
        if (isAdmin) {
            users = await this.userRepository.findAll();
        }

        let credentials = 0;
        let notes = 0;
        let files = 0;
        let storageBytes = 0;
        const fileTypes: { extension: string; count: number; bytes: number }[] = [];

        for (const item of items) {
            if (item.type === ItemType.CREDENTIAL) credentials++;
            if (item.type === ItemType.NOTE) notes++;

            if (item.type === ItemType.FILE) {
                files++;
                storageBytes += item.size || 0;

                const extension = getExtension(item.originalName);
                let fileType = fileTypes.find((type) => type.extension === extension);
                if (!fileType) {
                    fileType = { extension: extension, count: 0, bytes: 0 };
                    fileTypes.push(fileType);
                }
                fileType.count++;
                fileType.bytes += item.size || 0;
            }
        }

        fileTypes.sort((a, b) => b.count - a.count);

        const vaults = [];
        for (const folder of folders) {
            const vault = { id: folder.id, name: folder.name, total: 0, credentials: 0, notes: 0, files: 0 };
            for (const item of items) {
                if (item.folderId !== folder.id) continue;
                vault.total++;
                if (item.type === ItemType.CREDENTIAL) vault.credentials++;
                if (item.type === ItemType.NOTE) vault.notes++;
                if (item.type === ItemType.FILE) vault.files++;
            }
            vaults.push(vault);
        }

        vaults.sort((a, b) => b.total - a.total);

        const recentItems = [];
        for (const item of items.slice(0, 6)) {
            const folder = folders.find((f) => f.id === item.folderId);
            const creator = users.find((u) => u.id === item.createdBy);

            recentItems.push({
                id: item.id,
                title: item.title,
                type: item.type,
                folderId: item.folderId,
                folderName: folder ? folder.name : "",
                createdAt: item.createdAt,
                createdBy: creator ? creator.firstName + " " + creator.lastName : null,
            });
        }

        const userStats = [];
        for (const user of users) {
            let itemsCreated = 0;
            let filesCreated = 0;
            let lastActivity: Date | null = null;

            for (const item of items) {
                if (item.createdBy !== user.id) continue;
                itemsCreated++;
                if (item.type === ItemType.FILE) filesCreated++;
                if (!lastActivity || item.updatedAt > lastActivity) lastActivity = item.updatedAt;
            }

            userStats.push({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                memberRole: user.memberRole ? { name: user.memberRole.name, icon: user.memberRole.icon } : null,
                mustChangePassword: user.mustChangePassword,
                itemsCreated: itemsCreated,
                filesCreated: filesCreated,
                lastActivity: lastActivity,
                createdAt: user.createdAt,
            });
        }

        return {
            totals: {
                vaults: folders.length,
                items: items.length,
                credentials: credentials,
                notes: notes,
                files: files,
                storageBytes: storageBytes,
                users: isAdmin ? users.length : null,
            },
            fileTypes: fileTypes,
            vaults: vaults,
            recentItems: recentItems,
            users: userStats,
        };
    }
}
