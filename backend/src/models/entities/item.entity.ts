import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { Folder } from "./folder.entity";
import { User } from "./user.entity";
import { ItemType } from "../enums/item-type.enum";

@Entity("items")
export class Item {
    @PrimaryGeneratedColumn()
    id!: number;

    @Index()
    @Column({ name: "folder_id", type: "int" })
    folderId!: number;

    @ManyToOne(() => Folder, { onDelete: "CASCADE" })
    @JoinColumn({ name: "folder_id" })
    folder!: Folder;

    @Column({ type: "enum", enum: ItemType })
    type!: ItemType;

    @Column({ type: "varchar", length: 255 })
    title!: string;

    @Column({ name: "encrypted_data", type: "mediumtext", nullable: true })
    encryptedData!: string | null;

    @Column({ name: "file_path", type: "varchar", length: 255, nullable: true })
    filePath!: string | null;

    @Column({ name: "original_name", type: "varchar", length: 255, nullable: true })
    originalName!: string | null;

    @Column({ name: "mime_type", type: "varchar", length: 100, nullable: true })
    mimeType!: string | null;

    @Column({ type: "int", nullable: true })
    size!: number | null;

    @Column({ name: "created_by", type: "int", nullable: true })
    createdBy!: number | null;

    @ManyToOne(() => User, { onDelete: "SET NULL" })
    @JoinColumn({ name: "created_by" })
    creator!: User | null;

    @Column({ name: "updated_by", type: "int", nullable: true })
    updatedBy!: number | null;

    @ManyToOne(() => User, { onDelete: "SET NULL" })
    @JoinColumn({ name: "updated_by" })
    updater!: User | null;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;
}
