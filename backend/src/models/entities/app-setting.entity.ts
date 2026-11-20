import { Column, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity("app_settings")
export class AppSetting {
    @PrimaryColumn({ name: "setting_key", type: "varchar", length: 100 })
    key!: string;

    @Column({ type: "text", nullable: true })
    value!: string | null;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;
}
