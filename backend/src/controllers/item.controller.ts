import { Request, Response } from "express";
import { ItemService, ItemUpdate } from "../services/item.service";
import { handleError } from "../utils/handle-error";
import { parseId } from "../utils/parse-id";

const INLINE_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/gif", "image/webp", "text/plain"];

function isValidTitle(title: any) {
    return typeof title === "string" && title.trim().length > 0 && title.trim().length <= 255;
}

function isFilled(value: any) {
    return typeof value === "string" && value.trim().length > 0;
}

function isOptionalText(value: any) {
    return value === undefined || value === null || typeof value === "string";
}

export class ItemController {
    private itemService = new ItemService();

    list = async (request: Request, response: Response) => {
        let search = undefined;
        if (typeof request.query.q === "string") {
            search = request.query.q;
        }

        try {
            const items = await this.itemService.list(request.folder!.id, search);
            return response.status(200).json({ success: true, data: items });
        } catch (error) {
            return handleError(response, error);
        }
    };

    createNote = async (request: Request, response: Response) => {
        const { title, body } = request.body || {};

        if (!isValidTitle(title)) {
            return response.status(400).json({ success: false, message: "Title is required (max 255 characters)" });
        }
        if (typeof body !== "string") {
            return response.status(400).json({ success: false, message: "Body should be text" });
        }

        try {
            const item = await this.itemService.createNote(request.folder!.id, request.user!.id, {
                title: title.trim(),
                body: body,
            });
            return response.status(201).json({ success: true, data: item });
        } catch (error) {
            return handleError(response, error);
        }
    };

    createCredential = async (request: Request, response: Response) => {
        const { title, username, password, url, notes } = request.body || {};

        if (!isValidTitle(title)) {
            return response.status(400).json({ success: false, message: "Title is required (max 255 characters)" });
        }
        if (!isFilled(username) || !isFilled(password)) {
            return response.status(400).json({ success: false, message: "Username and password are required" });
        }
        if (!isOptionalText(url) || !isOptionalText(notes)) {
            return response.status(400).json({ success: false, message: "Invalid data" });
        }

        try {
            const item = await this.itemService.createCredential(request.folder!.id, request.user!.id, {
                title: title.trim(),
                username: username,
                password: password,
                url: url || null,
                notes: notes || null,
            });
            return response.status(201).json({ success: true, data: item });
        } catch (error) {
            return handleError(response, error);
        }
    };

    createFile = async (request: Request, response: Response) => {
        const file = request.file!;

        let title = "";
        if (request.body && typeof request.body.title === "string") {
            title = request.body.title.trim();
        }
        if (title.length > 255) {
            return response.status(400).json({ success: false, message: "Title should have at most 255 characters" });
        }

        try {
            const item = await this.itemService.createFile(request.folder!.id, request.user!.id, {
                title: title,
                originalName: file.originalname.slice(0, 255),
                mimeType: (file.mimetype || "application/octet-stream").slice(0, 100),
                buffer: file.buffer,
            });
            return response.status(201).json({ success: true, data: item });
        } catch (error) {
            return handleError(response, error);
        }
    };

    get = async (request: Request, response: Response) => {
        const itemId = parseId(request.params.itemId);
        if (!itemId) {
            return response.status(404).json({ success: false, message: "Item not found" });
        }

        try {
            const item = await this.itemService.get(request.folder!.id, itemId);
            return response.status(200).json({ success: true, data: item });
        } catch (error) {
            return handleError(response, error);
        }
    };

    update = async (request: Request, response: Response) => {
        const itemId = parseId(request.params.itemId);
        if (!itemId) {
            return response.status(404).json({ success: false, message: "Item not found" });
        }

        const { title, body, username, password, url, notes } = request.body || {};
        const changes: ItemUpdate = {};

        if (title !== undefined) {
            if (!isValidTitle(title)) {
                return response.status(400).json({ success: false, message: "Title is required (max 255 characters)" });
            }
            changes.title = title.trim();
        }
        if (body !== undefined) {
            if (typeof body !== "string") {
                return response.status(400).json({ success: false, message: "Body should be text" });
            }
            changes.body = body;
        }
        if (username !== undefined) {
            if (!isFilled(username)) {
                return response.status(400).json({ success: false, message: "Username cannot be empty" });
            }
            changes.username = username;
        }
        if (password !== undefined) {
            if (!isFilled(password)) {
                return response.status(400).json({ success: false, message: "Password cannot be empty" });
            }
            changes.password = password;
        }
        if (url !== undefined) {
            if (!isOptionalText(url)) {
                return response.status(400).json({ success: false, message: "Invalid data" });
            }
            changes.url = url;
        }
        if (notes !== undefined) {
            if (!isOptionalText(notes)) {
                return response.status(400).json({ success: false, message: "Invalid data" });
            }
            changes.notes = notes;
        }

        try {
            const item = await this.itemService.update(request.folder!.id, itemId, request.user!.id, changes);
            return response.status(200).json({ success: true, data: item });
        } catch (error) {
            return handleError(response, error);
        }
    };

    delete = async (request: Request, response: Response) => {
        const itemId = parseId(request.params.itemId);
        if (!itemId) {
            return response.status(404).json({ success: false, message: "Item not found" });
        }

        try {
            await this.itemService.delete(request.folder!.id, itemId);
            return response.status(200).json({ success: true, message: "Item deleted" });
        } catch (error) {
            return handleError(response, error);
        }
    };

    reveal = async (request: Request, response: Response) => {
        const itemId = parseId(request.params.itemId);
        if (!itemId) {
            return response.status(404).json({ success: false, message: "Item not found" });
        }

        try {
            const data = await this.itemService.reveal(request.folder!.id, itemId);
            response.setHeader("Cache-Control", "no-store");
            return response.status(200).json({ success: true, data });
        } catch (error) {
            return handleError(response, error);
        }
    };

    download = async (request: Request, response: Response) => {
        const itemId = parseId(request.params.itemId);
        if (!itemId) {
            return response.status(404).json({ success: false, message: "Item not found" });
        }

        try {
            const file = await this.itemService.download(request.folder!.id, itemId);

            // pdfs and images can open in the browser, everything else is only downloaded
            let contentType = "application/octet-stream";
            let disposition = "attachment";
            if (INLINE_TYPES.includes(file.mimeType)) {
                contentType = file.mimeType;
                disposition = "inline";
            }

            response.setHeader("Content-Type", contentType);
            response.setHeader("Content-Disposition", disposition + "; filename*=UTF-8''" + encodeURIComponent(file.fileName));
            response.setHeader("X-Content-Type-Options", "nosniff");
            response.setHeader("Cache-Control", "no-store");
            return response.status(200).send(file.content);
        } catch (error) {
            return handleError(response, error);
        }
    };
}
