import { UserRole } from "../models/enums/user-role.enum";
import { UserRepository } from "../repositories/user.repository";
import { AuthUser, MemberPermissions } from "../types/express";

const userRepository = new UserRepository();

export async function getPermissions(user: AuthUser): Promise<MemberPermissions> {
    if (user.role === UserRole.ADMIN) {
        return { canView: true, canEdit: true, canDelete: true };
    }

    const dbUser = await userRepository.findById(user.id);
    if (!dbUser) {
        return { canView: false, canEdit: false, canDelete: false };
    }

    if (!dbUser.memberRole) {
        return { canView: true, canEdit: false, canDelete: false };
    }

    return {
        canView: dbUser.memberRole.canView,
        canEdit: dbUser.memberRole.canEdit,
        canDelete: dbUser.memberRole.canDelete,
    };
}
