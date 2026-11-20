import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const PASSWORD_CHANGE_ROUTES = ["GET /api/users/me", "PATCH /api/users/me/password"];

export function authenticate(request: Request, response: Response, next: NextFunction) {
    const header = request.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        return response.status(401).json({ success: false, message: "Unauthorized" });
    }

    const token = header.replace("Bearer ", "");

    let payload: any;
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
        return response.status(401).json({ success: false, message: "Unauthorized" });
    }

    // a user with a temporary password can only change the password
    if (payload.mustChangePassword) {
        const route = request.method + " " + request.originalUrl.split("?")[0];
        if (!PASSWORD_CHANGE_ROUTES.includes(route)) {
            return response.status(403).json({
                success: false,
                code: "PASSWORD_CHANGE_REQUIRED",
                message: "You must change your password first",
            });
        }
    }

    request.user = { id: payload.sub, email: payload.email, role: payload.role };
    next();
}
