import jwt from "jsonwebtoken";
import { UserRole } from "../models/enums/user-role.enum";

export function signToken(user: { id: number; email: string; role: UserRole; mustChangePassword: boolean }) {
    const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
    };

    return jwt.sign(payload, process.env.JWT_SECRET!, {
        expiresIn: "1h",
        issuer: process.env.JWT_ISSUER!,
        audience: process.env.JWT_AUDIENCE!,
    });
}
