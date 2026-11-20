import { AppError } from "../errors/app-error";
import { RoleData, RoleRepository } from "../repositories/role.repository";

export class RoleService {
    private roleRepository = new RoleRepository();

    async list() {
        const roles = await this.roleRepository.findAll();

        const result = [];
        for (const role of roles) {
            const userCount = await this.roleRepository.countUsers(role.id);
            result.push({ ...role, userCount });
        }
        return result;
    }

    async create(data: RoleData) {
        const existing = await this.roleRepository.findByName(data.name!);
        if (existing) {
            throw new AppError("A role with this name already exists", 409);
        }
        return this.roleRepository.create(data);
    }

    async update(id: number, data: RoleData) {
        const role = await this.roleRepository.findById(id);
        if (!role) {
            throw new AppError("Role not found", 404);
        }

        if (data.name !== undefined) {
            const existing = await this.roleRepository.findByName(data.name);
            if (existing && existing.id !== id) {
                throw new AppError("A role with this name already exists", 409);
            }
        }

        await this.roleRepository.update(id, data);
        return this.roleRepository.findById(id);
    }

    async delete(id: number) {
        const role = await this.roleRepository.findById(id);
        if (!role) {
            throw new AppError("Role not found", 404);
        }
        await this.roleRepository.delete(id);
    }
}
