import "dotenv/config";
import app from "./app";
import { AppDataSource } from "./config/data-source";

const port = process.env.PORT || 3000;

async function start() {
    try {
        await AppDataSource.initialize();
        console.log("Database connected");

        app.listen(port, () => {
            console.log("Server running on http://localhost:" + port);
        });
    } catch (error) {
        console.error("Error during startup", error);
        process.exit(1);
    }
}

start();
