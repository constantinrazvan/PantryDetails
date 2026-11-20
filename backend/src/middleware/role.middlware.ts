import { NextFunction, Request, Response } from "express";
import { UserRole } from "../models/enums/user-role.enum";

export function requireRole(...roles: UserRole[]) {
    return (request: Request, response: Response, next: NextFunction) => {
        if (!request.user) {
            return response.status(401).json({ success: false, message: "Unauthorized" });
        }
        if (!roles.includes(request.user.role)) {
            return response.status(403).json({ success: false, message: "Forbidden" });
        }
        next();
    };
}
