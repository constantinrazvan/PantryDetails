import { Request, Response } from "express";
import { FolderService } from "../services/folder.service";
import { FolderPermission } from "../models/enums/folder-permission.enum";
import { handleError } from "../utils/handle-error";
import { parseId } from "../utils/parse-id";

function isValidName(name: any) {
    return typeof name === "string" && name.trim().length > 0 && name.trim().length <= 150;
}

function isValidDescription(description: any) {
    return description === undefined || description === null || typeof description === "string";
}

export class FolderController {
    private folderService = new FolderService();

    list = async (request: Request, response: Response) => {
        try {
            const folders = await this.folderService.list(request.user!);
            return response.status(200).json({ success: true, data: folders });
        } catch (error) {
            return handleError(response, error);
        }
    };

    get = async (request: Request, response: Response) => {
        const folder = this.folderService.withPermissions(request.folder!, request.permissions!);
        return response.status(200).json({ success: true, data: folder });
    };

    create = async (request: Request, response: Response) => {
        const { name, description } = request.body || {};

        if (!isValidName(name)) {
            return response.status(400).json({ success: false, message: "Name is required (max 150 characters)" });
        }
        if (!isValidDescription(description)) {
            return response.status(400).json({ success: false, message: "Description should be text" });
        }

        try {
            const folder = await this.folderService.create(request.user!.id, name.trim(), description || null);
            return response.status(201).json({ success: true, data: folder });
        } catch (error) {
            return handleError(response, error);
        }
    };

    update = async (request: Request, response: Response) => {
        const { name, description } = request.body || {};
        const changes: { name?: string; description?: string | null } = {};

        if (name !== undefined) {
            if (!isValidName(name)) {
                return response.status(400).json({ success: false, message: "Name is required (max 150 characters)" });
            }
            changes.name = name.trim();
        }
        if (description !== undefined) {
            if (!isValidDescription(description)) {
                return response.status(400).json({ success: false, message: "Description should be text" });
            }
            changes.description = description;
        }

        try {
            const folder = await this.folderService.update(request.folder!.id, changes);
            return response.status(200).json({ success: true, data: folder });
        } catch (error) {
            return handleError(response, error);
        }
    };

    delete = async (request: Request, response: Response) => {
        try {
            await this.folderService.delete(request.folder!.id);
            return response.status(200).json({ success: true, message: "Folder deleted" });
        } catch (error) {
            return handleError(response, error);
        }
    };

    listAccess = async (request: Request, response: Response) => {
        try {
            const rows = await this.folderService.listAccess(request.folder!.id);
            return response.status(200).json({ success: true, data: rows });
        } catch (error) {
            return handleError(response, error);
        }
    };

    grantAccess = async (request: Request, response: Response) => {
        const userId = parseId(request.params.userId);
        if (!userId) {
            return response.status(404).json({ success: false, message: "User not found" });
        }

        let permission = FolderPermission.READ;
        if (request.body && request.body.permission !== undefined) {
            permission = request.body.permission;
        }

        if (permission !== FolderPermission.READ && permission !== FolderPermission.WRITE) {
            return response.status(400).json({ success: false, message: "Permission should be 'read' or 'write'" });
        }

        try {
            await this.folderService.grantAccess(request.folder!.id, userId, permission);
            return response.status(200).json({ success: true, message: "Access granted" });
        } catch (error) {
            return handleError(response, error);
        }
    };

    revokeAccess = async (request: Request, response: Response) => {
        const userId = parseId(request.params.userId);
        if (!userId) {
            return response.status(404).json({ success: false, message: "User not found" });
        }

        try {
            await this.folderService.revokeAccess(request.folder!.id, userId);
            return response.status(200).json({ success: true, message: "Access revoked" });
        } catch (error) {
            return handleError(response, error);
        }
    };
}
