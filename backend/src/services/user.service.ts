import crypto from "crypto";
import bcrypt from "bcrypt";
import { UserRepository, UserSearchFilters } from "../repositories/user.repository";
import { RoleRepository } from "../repositories/role.repository";
import { MailService } from "./mail.service";
import { AppError } from "../errors/app-error";
import { UserRole } from "../models/enums/user-role.enum";
import { signToken } from "../utils/sign-token";

const PASSWORD_CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";

function generatePassword() {
    let password = "";
    for (let i = 0; i < 14; i++) {
        const index = crypto.randomInt(PASSWORD_CHARACTERS.length);
        password += PASSWORD_CHARACTERS[index];
    }
    return password;
}

export interface NewUserData {
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    roleId: number | null;
}

export class UserService {
    private userRepository = new UserRepository();
    private roleRepository = new RoleRepository();
    private mailService = new MailService();

    list(filters: UserSearchFilters) {
        return this.userRepository.search(filters);
    }

    async create(data: NewUserData) {
        const email = data.email.trim().toLowerCase();

        const existing = await this.userRepository.findByEmail(email);
        if (existing) {
            throw new AppError("Email is already in use", 409);
        }

        if (data.roleId !== null) {
            const role = await this.roleRepository.findById(data.roleId);
            if (!role) {
                throw new AppError("Role not found", 400);
            }
        }

        const temporaryPassword = generatePassword();
        const userId = await this.userRepository.create({
            firstName: data.firstName,
            lastName: data.lastName,
            email: email,
            role: data.role,
            roleId: data.roleId,
            password: await bcrypt.hash(temporaryPassword, 10),
            mustChangePassword: true,
        });

        const loginUrl = (process.env.FRONTEND_URL || "http://localhost:4200") + "/login";
        const text =
            "Hello " + data.firstName + ",\n\n" +
            "An account was created for you on PantryDetails.\n\n" +
            "Email: " + email + "\n" +
            "Temporary password: " + temporaryPassword + "\n\n" +
            "Sign in at " + loginUrl + " - you will be asked to choose a new password.";

        let mailSent = true;
        try {
            await this.mailService.send(email, "Your PantryDetails account", text);
        } catch (error) {
            console.error("Failed to send welcome email:", error);
            mailSent = false;
        }

        const user = await this.userRepository.findById(userId);

        // if the email was not sent, the admin sees the password on screen
        if (mailSent) {
            return { user, mailSent };
        }
        return { user, mailSent, temporaryPassword };
    }

    async adminUpdate(adminId: number, userId: number, data: { role?: UserRole; roleId?: number | null }) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new AppError("User not found", 404);
        }

        if (data.roleId) {
            const role = await this.roleRepository.findById(data.roleId);
            if (!role) {
                throw new AppError("Role not found", 400);
            }
        }

        if (data.role === UserRole.USER && user.role === UserRole.ADMIN) {
            if (adminId === userId) {
                throw new AppError("You cannot remove your own admin rights", 400);
            }

            const adminCount = await this.userRepository.countAdmins();
            if (adminCount <= 1) {
                throw new AppError("There must be at least one admin", 400);
            }
        }

        await this.userRepository.updateRole(userId, data);
        return this.userRepository.findById(userId);
    }

    async delete(adminId: number, userId: number) {
        if (adminId === userId) {
            throw new AppError("You cannot delete your own account", 400);
        }

        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new AppError("User not found", 404);
        }

        // keep at least one admin
        if (user.role === UserRole.ADMIN) {
            const adminCount = await this.userRepository.countAdmins();
            if (adminCount <= 1) {
                throw new AppError("There must be at least one admin", 400);
            }
        }

        await this.userRepository.delete(userId);
    }

    async me(userId: number) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new AppError("User not found", 404);
        }
        return user;
    }

    async updateProfile(userId: number, firstName: string, lastName: string) {
        const user = await this.me(userId);
        await this.userRepository.updateName(user.id, firstName, lastName);
        return this.userRepository.findById(user.id);
    }

    async changeEmail(userId: number, newEmail: string) {
        const user = await this.me(userId);
        const email = newEmail.trim().toLowerCase();

        if (email === user.email) {
            throw new AppError("New email must be different from the current one", 400);
        }

        const existing = await this.userRepository.findByEmail(email);
        if (existing) {
            throw new AppError("Email is already in use", 409);
        }

        await this.userRepository.updateEmail(user.id, email);

        const text =
            "Hello " + user.firstName + ",\n\n" +
            "The email address of your account was changed to " + email + ".\n" +
            "If you didn't do this, please contact support immediately.";

        this.mailService
            .send(user.email, "Email changed - PantryDetails", text)
            .catch((error) => console.error("Failed to send email changed notice:", error));

        return this.userRepository.findById(user.id);
    }

    async changePassword(userId: number, oldPassword: string, newPassword: string) {
        const user = await this.userRepository.findByIdWithPassword(userId);
        if (!user) {
            throw new AppError("User not found", 404);
        }

        const passwordOk = await bcrypt.compare(oldPassword, user.password);
        if (!passwordOk) {
            throw new AppError("Current password is incorrect", 400);
        }

        if (oldPassword === newPassword) {
            throw new AppError("New password must be different from the current one", 400);
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);
        await this.userRepository.updatePassword(user.id, passwordHash);

        const text =
            "Hello " + user.firstName + ",\n\n" +
            "Your password was changed successfully.\n" +
            "If you didn't do this, please reset your password immediately.";

        this.mailService
            .send(user.email, "Password changed - PantryDetails", text)
            .catch((error) => console.error("Failed to send password changed notice:", error));

        return signToken({ id: user.id, email: user.email, role: user.role, mustChangePassword: false });
    }
}
