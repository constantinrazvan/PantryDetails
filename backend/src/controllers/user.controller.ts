import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { handleError } from "../utils/handle-error";
import { UserRole } from "../models/enums/user-role.enum";
import { parseId } from "../utils/parse-id";
import { UserSearchFilters } from "../repositories/user.repository";

function isValidName(name: any) {
    return typeof name === "string" && name.trim().length > 0 && name.trim().length <= 100;
}

function isValidRole(role: any) {
    return role === UserRole.ADMIN || role === UserRole.USER;
}

function isValidRoleId(roleId: any) {
    return roleId === null || Number.isInteger(roleId);
}

export class UserController {
    private userService = new UserService();

    list = async (request: Request, response: Response) => {
        const { search, access, role, status } = request.query;
        const filters: UserSearchFilters = {};

        if (typeof search === "string" && search.trim()) {
            filters.search = search.trim();
        }
        if (access === "admin" || access === "member") {
            filters.access = access;
        }
        if (typeof role === "string" && role) {
            filters.roleId = role;
        }
        if (status === "active" || status === "pending") {
            filters.status = status;
        }

        try {
            const users = await this.userService.list(filters);
            return response.status(200).json({ success: true, data: users });
        } catch (error) {
            return handleError(response, error);
        }
    };

    create = async (request: Request, response: Response) => {
        const { firstName, lastName, email, role, roleId } = request.body || {};

        if (!isValidName(firstName) || !isValidName(lastName)) {
            return response.status(400).json({
                success: false,
                message: "First name and last name are required (max 100 characters)",
            });
        }
        if (typeof email !== "string" || !email.includes("@") || email.length > 255) {
            return response.status(400).json({ success: false, message: "Email should be valid" });
        }
        if (role !== undefined && !isValidRole(role)) {
            return response.status(400).json({ success: false, message: "Role should be 'admin' or 'user'" });
        }
        if (roleId !== undefined && !isValidRoleId(roleId)) {
            return response.status(400).json({ success: false, message: "roleId should be a number or null" });
        }

        try {
            const result = await this.userService.create({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email,
                role: role || UserRole.USER,
                roleId: roleId || null,
            });
            return response.status(201).json({ success: true, data: result });
        } catch (error) {
            return handleError(response, error);
        }
    };

    adminUpdate = async (request: Request, response: Response) => {
        const userId = parseId(request.params.userId);
        if (!userId) {
            return response.status(404).json({ success: false, message: "User not found" });
        }

        const { role, roleId } = request.body || {};
        const changes: { role?: UserRole; roleId?: number | null } = {};

        if (role !== undefined) {
            if (!isValidRole(role)) {
                return response.status(400).json({ success: false, message: "Role should be 'admin' or 'user'" });
            }
            changes.role = role;
        }
        if (roleId !== undefined) {
            if (!isValidRoleId(roleId)) {
                return response.status(400).json({ success: false, message: "roleId should be a number or null" });
            }
            changes.roleId = roleId;
        }

        try {
            const user = await this.userService.adminUpdate(request.user!.id, userId, changes);
            return response.status(200).json({ success: true, data: user });
        } catch (error) {
            return handleError(response, error);
        }
    };

    delete = async (request: Request, response: Response) => {
        const userId = parseId(request.params.userId);
        if (!userId) {
            return response.status(404).json({ success: false, message: "User not found" });
        }

        try {
            await this.userService.delete(request.user!.id, userId);
            return response.status(200).json({ success: true, message: "User deleted" });
        } catch (error) {
            return handleError(response, error);
        }
    };

    me = async (request: Request, response: Response) => {
        try {
            const user = await this.userService.me(request.user!.id);
            return response.status(200).json({ success: true, data: user });
        } catch (error) {
            return handleError(response, error);
        }
    };

    updateProfile = async (request: Request, response: Response) => {
        const { firstName, lastName } = request.body || {};

        if (!isValidName(firstName) || !isValidName(lastName)) {
            return response.status(400).json({
                success: false,
                message: "First name and last name are required (max 100 characters)",
            });
        }

        try {
            const user = await this.userService.updateProfile(request.user!.id, firstName.trim(), lastName.trim());
            return response.status(200).json({ success: true, data: user });
        } catch (error) {
            return handleError(response, error);
        }
    };

    changeEmail = async (request: Request, response: Response) => {
        const { email } = request.body || {};

        if (typeof email !== "string" || !email.trim()) {
            return response.status(400).json({ success: false, message: "Email is required" });
        }
        if (!email.includes("@")) {
            return response.status(400).json({ success: false, message: "Email should be valid" });
        }

        try {
            const user = await this.userService.changeEmail(request.user!.id, email);
            return response.status(200).json({ success: true, data: user });
        } catch (error) {
            return handleError(response, error);
        }
    };

    changePassword = async (request: Request, response: Response) => {
        const { oldPassword, newPassword } = request.body || {};

        if (typeof oldPassword !== "string" || typeof newPassword !== "string" || !oldPassword || !newPassword) {
            return response.status(400).json({ success: false, message: "All data should be filled" });
        }
        if (newPassword.length < 8) {
            return response.status(400).json({ success: false, message: "Password should have at least 8 characters" });
        }

        try {
            const token = await this.userService.changePassword(request.user!.id, oldPassword, newPassword);
            return response.status(200).json({ success: true, message: "Password has been changed", data: { token } });
        } catch (error) {
            return handleError(response, error);
        }
    };
}
