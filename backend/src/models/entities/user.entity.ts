import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { UserRole } from "../enums/user-role.enum";
import { Role } from "./role.entity";

@Entity("users")
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: "first_name", type: "varchar", length: 100 })
    firstName!: string;

    @Column({ name: "last_name", type: "varchar", length: 100 })
    lastName!: string;

    @Column({ type: "varchar", length: 255, unique: true })
    email!: string;

    @Column({ type: "varchar", length: 255, select: false })
    password!: string;

    @Column({ type: "enum", enum: UserRole, default: UserRole.USER })
    role!: UserRole;

    @Column({ name: "role_id", type: "int", nullable: true })
    roleId!: number | null;

    @ManyToOne(() => Role, { nullable: true, onDelete: "SET NULL", eager: true })
    @JoinColumn({ name: "role_id" })
    memberRole!: Role | null;

    @Column({ name: "must_change_password", type: "boolean", default: false })
    mustChangePassword!: boolean;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;
}
