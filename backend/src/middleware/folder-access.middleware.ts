import { NextFunction, Request, Response } from "express";
import { FolderRepository } from "../repositories/folder.repository";
import { FolderAccessRepository } from "../repositories/folder-access.repository";
import { UserRole } from "../models/enums/user-role.enum";
import { parseId } from "../utils/parse-id";
import { getPermissions } from "../utils/member-permissions";

const folderRepository = new FolderRepository();
const folderAccessRepository = new FolderAccessRepository();

export async function loadFolderAccess(request: Request, response: Response, next: NextFunction) {
    const folderId = parseId(request.params.folderId);
    if (!folderId) {
        return response.status(404).json({ success: false, message: "Folder not found" });
    }

    const folder = await folderRepository.findById(folderId);
    if (!folder) {
        return response.status(404).json({ success: false, message: "Folder not found" });
    }

    if (request.user!.role !== UserRole.ADMIN) {
        const access = await folderAccessRepository.find(folder.id, request.user!.id);
        if (!access) {
            return response.status(404).json({ success: false, message: "Folder not found" });
        }
    }

    const permissions = await getPermissions(request.user!);
    if (!permissions.canView) {
        return response.status(404).json({ success: false, message: "Folder not found" });
    }

    request.folder = folder;
    request.permissions = permissions;
    next();
}

export function requireFolderWrite(request: Request, response: Response, next: NextFunction) {
    if (!request.permissions || !request.permissions.canEdit) {
        return response.status(403).json({ success: false, message: "Forbidden" });
    }
    next();
}

export function requireFolderDelete(request: Request, response: Response, next: NextFunction) {
    if (!request.permissions || !request.permissions.canDelete) {
        return response.status(403).json({ success: false, message: "Forbidden" });
    }
    next();
}
