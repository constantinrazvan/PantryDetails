import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("roles")
export class Role {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 50, unique: true })
    name!: string;

    @Column({ type: "varchar", length: 50 })
    icon!: string;

    @Column({ name: "can_view", type: "boolean", default: true })
    canView!: boolean;

    @Column({ name: "can_edit", type: "boolean", default: false })
    canEdit!: boolean;

    @Column({ name: "can_delete", type: "boolean", default: false })
    canDelete!: boolean;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;
}
