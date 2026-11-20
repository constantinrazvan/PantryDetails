import { AppDataSource } from "../config/data-source";
import { Folder } from "../models/entities/folder.entity";
import { FolderAccess } from "../models/entities/folder-access.entity";

export class FolderRepository {
    private get repository() {
        return AppDataSource.getRepository(Folder);
    }

    private get accessRepository() {
        return AppDataSource.getRepository(FolderAccess);
    }

    findAll() {
        return this.repository.find({ order: { name: "ASC" } });
    }

    async findAllForUser(userId: number) {
        const rows = await this.accessRepository.find({
            where: { userId },
            relations: { folder: true },
            order: { folder: { name: "ASC" } },
        });

        const folders: Folder[] = [];
        for (const row of rows) {
            folders.push(row.folder);
        }
        return folders;
    }

    findById(id: number) {
        return this.repository.findOneBy({ id });
    }

    create(data: { name: string; description: string | null; createdBy: number; isDemo?: boolean }) {
        return this.repository.save(this.repository.create(data));
    }

    findDemo() {
        return this.repository.findBy({ isDemo: true });
    }

    async update(id: number, data: { name?: string; description?: string | null }) {
        await this.repository.update({ id }, data);
    }

    async delete(id: number) {
        await this.repository.delete({ id });
    }
}
