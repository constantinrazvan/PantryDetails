import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../models/entities/user.entity";
import { PasswordReset } from "../models/entities/password-reset.entity";
import { Folder } from "../models/entities/folder.entity";
import { FolderAccess } from "../models/entities/folder-access.entity";
import { Item } from "../models/entities/item.entity";
import { Role } from "../models/entities/role.entity";
import { AppSetting } from "../models/entities/app-setting.entity";

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 3306),
    username: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME ?? "pantry_details",
    entities: [User, PasswordReset, Folder, FolderAccess, Item, Role, AppSetting],
    synchronize: process.env.NODE_ENV !== "production",
});
