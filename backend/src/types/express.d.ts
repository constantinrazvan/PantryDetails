import { UserRole } from "../models/enums/user-role.enum";
import { Folder } from "../models/entities/folder.entity";

export interface AuthUser {
    id: number;
    email: string;
    role: UserRole;
}

export interface MemberPermissions {
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
            folder?: Folder;
            permissions?: MemberPermissions;
        }
    }
}
