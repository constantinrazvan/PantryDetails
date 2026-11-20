import { CorsOptions } from "cors";

export function corsOptions(): CorsOptions {
    let origins = ["http://localhost:4200"];
    if (process.env.CORS_ORIGINS) {
        origins = process.env.CORS_ORIGINS.split(",");
    }

    return {
        origin: origins,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        exposedHeaders: ["Content-Disposition"],
    };
}
