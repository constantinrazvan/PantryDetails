import "dotenv/config";
import { AppDataSource } from "../config/data-source";
import { UserRepository } from "../repositories/user.repository";
import { DemoDataService } from "../services/demo-data.service";

async function seedFolders() {
    await AppDataSource.initialize();

    const admin = await new UserRepository().findByEmail("admin@pantrydetails.local");
    if (!admin) {
        console.log("The admin is missing. Run first: npm run seed:users");
        await AppDataSource.destroy();
        return;
    }

    const result = await new DemoDataService().importData(admin.id);
    console.log("Demo vaults created: " + result.created);

    await AppDataSource.destroy();
}

seedFolders();
