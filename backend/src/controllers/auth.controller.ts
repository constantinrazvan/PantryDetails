import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { handleError } from "../utils/handle-error";

export class AuthController {
    private authService = new AuthService();

    login = async (request: Request, response: Response) => {
        const { email, password } = request.body || {};

        if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
            return response.status(400).json({ success: false, message: "All data should be filled" });
        }
        if (!email.includes("@")) {
            return response.status(400).json({ success: false, message: "Email should be valid" });
        }

        try {
            const result = await this.authService.login(email, password);
            if (!result) {
                return response.status(401).json({ success: false, message: "Invalid credentials" });
            }
            return response.status(200).json({ success: true, data: result });
        } catch (error) {
            return handleError(response, error);
        }
    };

    forgotPassword = async (request: Request, response: Response) => {
        const { email } = request.body || {};

        if (typeof email !== "string" || !email) {
            return response.status(400).json({ success: false, message: "Email is required" });
        }
        if (!email.includes("@")) {
            return response.status(400).json({ success: false, message: "Email should be valid" });
        }

        try {
            await this.authService.forgotPassword(email);
            return response.status(200).json({
                success: true,
                message: "If an account exists for this email, a reset link has been sent.",
            });
        } catch (error) {
            return handleError(response, error);
        }
    };

    resetPassword = async (request: Request, response: Response) => {
        const { token, password } = request.body || {};

        if (typeof token !== "string" || typeof password !== "string" || !token || !password) {
            return response.status(400).json({ success: false, message: "All data should be filled" });
        }
        if (password.length < 8) {
            return response.status(400).json({ success: false, message: "Password should have at least 8 characters" });
        }

        try {
            const ok = await this.authService.resetPassword(token, password);
            if (!ok) {
                return response.status(400).json({ success: false, message: "Reset link is invalid or has expired" });
            }
            return response.status(200).json({ success: true, message: "Password has been reset" });
        } catch (error) {
            return handleError(response, error);
        }
    };
}
