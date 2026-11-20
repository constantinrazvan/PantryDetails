import { Request, Response } from "express";
import { RoleService } from "../services/role.service";
import { RoleData } from "../repositories/role.repository";
import { ROLE_ICONS } from "../models/constants/role-icons";
import { handleError } from "../utils/handle-error";
import { parseId } from "../utils/parse-id";

function isValidName(name: any) {
    return typeof name === "string" && name.trim().length > 0 && name.trim().length <= 50;
}

function isValidIcon(icon: any) {
    return ROLE_ICONS.includes(icon);
}

function isOptionalBoolean(value: any) {
    return value === undefined || typeof value === "boolean";
}

export class RoleController {
    private roleService = new RoleService();

    icons = (request: Request, response: Response) => {
        return response.status(200).json({ success: true, data: ROLE_ICONS });
    };

    list = async (request: Request, response: Response) => {
        try {
            const roles = await this.roleService.list();
            return response.status(200).json({ success: true, data: roles });
        } catch (error) {
            return handleError(response, error);
        }
    };

    create = async (request: Request, response: Response) => {
        const { name, icon, canView, canEdit, canDelete } = request.body || {};

        if (!isValidName(name)) {
            return response.status(400).json({ success: false, message: "Name is required (max 50 characters)" });
        }
        if (!isValidIcon(icon)) {
            return response.status(400).json({ success: false, message: "Icon is not valid" });
        }
        if (!isOptionalBoolean(canView) || !isOptionalBoolean(canEdit) || !isOptionalBoolean(canDelete)) {
            return response.status(400).json({ success: false, message: "Permissions should be true or false" });
        }

        const data: RoleData = {
            name: name.trim(),
            icon: icon,
            canView: canView !== false,
            canEdit: canEdit === true,
            canDelete: canDelete === true,
        };

        try {
            const role = await this.roleService.create(data);
            return response.status(201).json({ success: true, data: role });
        } catch (error) {
            return handleError(response, error);
        }
    };

    update = async (request: Request, response: Response) => {
        const id = parseId(request.params.roleId);
        if (!id) {
            return response.status(404).json({ success: false, message: "Role not found" });
        }

        const { name, icon, canView, canEdit, canDelete } = request.body || {};
        const data: RoleData = {};

        if (name !== undefined) {
            if (!isValidName(name)) {
                return response.status(400).json({ success: false, message: "Name is required (max 50 characters)" });
            }
            data.name = name.trim();
        }
        if (icon !== undefined) {
            if (!isValidIcon(icon)) {
                return response.status(400).json({ success: false, message: "Icon is not valid" });
            }
            data.icon = icon;
        }
        if (!isOptionalBoolean(canView) || !isOptionalBoolean(canEdit) || !isOptionalBoolean(canDelete)) {
            return response.status(400).json({ success: false, message: "Permissions should be true or false" });
        }
        if (canView !== undefined) data.canView = canView;
        if (canEdit !== undefined) data.canEdit = canEdit;
        if (canDelete !== undefined) data.canDelete = canDelete;

        try {
            const role = await this.roleService.update(id, data);
            return response.status(200).json({ success: true, data: role });
        } catch (error) {
            return handleError(response, error);
        }
    };

    delete = async (request: Request, response: Response) => {
        const id = parseId(request.params.roleId);
        if (!id) {
            return response.status(404).json({ success: false, message: "Role not found" });
        }

        try {
            await this.roleService.delete(id);
            return response.status(200).json({ success: true, message: "Role deleted" });
        } catch (error) {
            return handleError(response, error);
        }
    };
}
