import { Response } from "express";
import { AppError } from "../errors/app-error";

export function handleError(response: Response, error: any) {
    if (error instanceof AppError) {
        return response.status(error.statusCode).json({ success: false, message: error.message });
    }

    console.error(error);
    return response.status(500).json({ success: false, message: "Server error" });
}
