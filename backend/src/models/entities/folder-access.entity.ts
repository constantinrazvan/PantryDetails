import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
} from "typeorm";
import { Folder } from "./folder.entity";
import { User } from "./user.entity";
import { FolderPermission } from "../enums/folder-permission.enum";

@Entity("folder_access")
@Unique("uq_folder_access_folder_user", ["folderId", "userId"])
export class FolderAccess {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: "folder_id", type: "int" })
    folderId!: number;

    @ManyToOne(() => Folder, { onDelete: "CASCADE" })
    @JoinColumn({ name: "folder_id" })
    folder!: Folder;

    @Column({ name: "user_id", type: "int" })
    userId!: number;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user!: User;

    @Column({ type: "enum", enum: FolderPermission })
    permission!: FolderPermission;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;
}
