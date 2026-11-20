import { AppDataSource } from "../config/data-source";
import { User } from "../models/entities/user.entity";
import { UserRole } from "../models/enums/user-role.enum";

export interface CreateUserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: UserRole;
    roleId: number | null;
    mustChangePassword: boolean;
}

export interface UserSearchFilters {
    search?: string;
    access?: string;
    roleId?: string;
    status?: string;
}

export class UserRepository {
    private get repository() {
        return AppDataSource.getRepository(User);
    }

    findAll() {
        return this.repository.find({ order: { lastName: "ASC", firstName: "ASC" } });
    }

    search(filters: UserSearchFilters) {
        const query = this.repository
            .createQueryBuilder("user")
            .leftJoinAndSelect("user.memberRole", "memberRole")
            .orderBy("user.lastName", "ASC")
            .addOrderBy("user.firstName", "ASC");

        if (filters.search) {
            query.andWhere(
                "(user.firstName LIKE :search OR user.lastName LIKE :search OR user.email LIKE :search)",
                { search: "%" + filters.search + "%" }
            );
        }

        if (filters.access === "admin") {
            query.andWhere("user.role = :role", { role: UserRole.ADMIN });
        }
        if (filters.access === "member") {
            query.andWhere("user.role = :role", { role: UserRole.USER });
        }

        if (filters.roleId === "none") {
            query.andWhere("user.roleId IS NULL");
        } else if (filters.roleId) {
            query.andWhere("user.roleId = :roleId", { roleId: Number(filters.roleId) });
        }

        if (filters.status === "active") {
            query.andWhere("user.mustChangePassword = false");
        }
        if (filters.status === "pending") {
            query.andWhere("user.mustChangePassword = true");
        }

        return query.getMany();
    }

    findById(id: number) {
        return this.repository.findOneBy({ id });
    }

    findByEmail(email: string) {
        return this.repository.findOneBy({ email: email.toLowerCase() });
    }

    findByEmailWithPassword(email: string) {
        return this.repository
            .createQueryBuilder("user")
            .addSelect("user.password")
            .where("user.email = :email", { email: email.toLowerCase() })
            .getOne();
    }

    findByIdWithPassword(id: number) {
        return this.repository
            .createQueryBuilder("user")
            .addSelect("user.password")
            .where("user.id = :id", { id })
            .getOne();
    }

    async updatePassword(id: number, passwordHash: string) {
        await this.repository.update({ id }, { password: passwordHash, mustChangePassword: false });
    }

    async updateRole(id: number, data: { role?: UserRole; roleId?: number | null }) {
        await this.repository.update({ id }, data);
    }

    async updateName(id: number, firstName: string, lastName: string) {
        await this.repository.update({ id }, { firstName, lastName });
    }

    async updateEmail(id: number, email: string) {
        await this.repository.update({ id }, { email: email.toLowerCase() });
    }

    async delete(id: number) {
        await this.repository.delete({ id });
    }

    countAdmins() {
        return this.repository.countBy({ role: UserRole.ADMIN });
    }

    async create(data: CreateUserData) {
        const user = this.repository.create(data);
        user.email = data.email.toLowerCase();
        const saved = await this.repository.save(user);
        return saved.id;
    }
}
