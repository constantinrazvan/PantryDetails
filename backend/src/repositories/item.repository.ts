import { In, Like } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { Item } from "../models/entities/item.entity";

export class ItemRepository {
    private get repository() {
        return AppDataSource.getRepository(Item);
    }

    listByFolder(folderId: number, search?: string) {
        if (search && search.trim()) {
            return this.repository.find({
                where: { folderId, title: Like("%" + search.trim() + "%") },
                order: { updatedAt: "DESC" },
            });
        }

        return this.repository.find({
            where: { folderId },
            order: { updatedAt: "DESC" },
        });
    }

    listByFolders(folderIds: number[]) {
        if (folderIds.length === 0) {
            return Promise.resolve([]);
        }

        return this.repository.find({
            where: { folderId: In(folderIds) },
            order: { createdAt: "DESC" },
        });
    }

    findInFolder(folderId: number, itemId: number) {
        return this.repository.findOneBy({ folderId, id: itemId });
    }

    create(data: any) {
        return this.repository.save(this.repository.create(data as Item));
    }

    async update(id: number, data: any) {
        await this.repository.update({ id }, data);
    }

    async delete(id: number) {
        await this.repository.delete({ id });
    }
}
