import { NextFunction, Request, Response } from "express";
import multer from "multer";

const maxMb = Number(process.env.MAX_UPLOAD_MB) || 25;

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxMb * 1024 * 1024, files: 1 },
}).single("file");

export function uploadSingleFile(request: Request, response: Response, next: NextFunction) {
    upload(request, response, (error: any) => {
        if (error && error.code === "LIMIT_FILE_SIZE") {
            return response.status(413).json({ success: false, message: "File is too large" });
        }
        if (error) {
            return response.status(400).json({ success: false, message: "Invalid upload" });
        }
        if (!request.file) {
            return response.status(400).json({ success: false, message: "File is required" });
        }

        // multer reads the name as latin1, we turn it into utf8 (for special characters)
        request.file.originalname = Buffer.from(request.file.originalname, "latin1").toString("utf8");
        next();
    });
}
