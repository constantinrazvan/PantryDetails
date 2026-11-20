import { AppDataSource } from "../config/data-source";
import { AppSetting } from "../models/entities/app-setting.entity";

export class AppSettingRepository {
    private get repository() {
        return AppDataSource.getRepository(AppSetting);
    }

    async get(key: string): Promise<string | null> {
        const setting = await this.repository.findOneBy({ key });
        if (!setting) {
            return null;
        }
        return setting.value;
    }

    async set(key: string, value: string | null) {
        await this.repository.save({ key, value });
    }
}
