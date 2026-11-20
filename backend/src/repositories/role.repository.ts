import { AppDataSource } from "../config/data-source";
import { Role } from "../models/entities/role.entity";
import { User } from "../models/entities/user.entity";

export interface RoleData {
    name?: string;
    icon?: string;
    canView?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
}

export class RoleRepository {
    private get repository() {
        return AppDataSource.getRepository(Role);
    }

    private get userRepository() {
        return AppDataSource.getRepository(User);
    }

    findAll() {
        return this.repository.find({ order: { name: "ASC" } });
    }

    findById(id: number) {
        return this.repository.findOneBy({ id });
    }

    findByName(name: string) {
        return this.repository.findOneBy({ name });
    }

    create(data: RoleData) {
        return this.repository.save(this.repository.create(data));
    }

    async update(id: number, data: RoleData) {
        await this.repository.update({ id }, data);
    }

    async delete(id: number) {
        await this.repository.delete({ id });
    }

    countUsers(roleId: number) {
        return this.userRepository.countBy({ roleId });
    }
}
