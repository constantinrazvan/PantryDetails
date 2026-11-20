import { IsNull, MoreThan, Repository } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { PasswordReset } from "../models/entities/password-reset.entity";

export class PasswordResetRepository {
    private get repository(): Repository<PasswordReset> {
        return AppDataSource.getRepository(PasswordReset);
    }

    create(userId: number, tokenHash: string, expiresAt: Date) {
        const reset = this.repository.create({ userId, tokenHash, expiresAt, usedAt: null });
        return this.repository.save(reset);
    }

    findValidByTokenHash(tokenHash: string) {
        return this.repository.findOne({
            where: {
                tokenHash,
                usedAt: IsNull(),
                expiresAt: MoreThan(new Date()),
            },
        });
    }

    async markAsUsed(id: number) {
        const result = await this.repository.update(
            { id, usedAt: IsNull() },
            { usedAt: new Date() }
        );
        return result.affected === 1;
    }

    async invalidateAllForUser(userId: number) {
        await this.repository.update(
            { userId, usedAt: IsNull() },
            { usedAt: new Date() }
        );
    }
}
