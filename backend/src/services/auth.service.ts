import crypto from "crypto";
import bcrypt from "bcrypt";
import { UserRepository } from "../repositories/user.repository";
import { PasswordResetRepository } from "../repositories/password-reset.repository";
import { MailService } from "./mail.service";
import { signToken } from "../utils/sign-token";

function hashToken(token: string) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

export class AuthService {
    private userRepository = new UserRepository();
    private passwordResetRepository = new PasswordResetRepository();
    private mailService = new MailService();

    async login(email: string, password: string) {
        const user = await this.userRepository.findByEmailWithPassword(email);
        if (!user) {
            return null;
        }

        const passwordOk = await bcrypt.compare(password, user.password);
        if (!passwordOk) {
            return null;
        }

        return {
            token: signToken(user),
            mustChangePassword: user.mustChangePassword,
            user: { email: user.email },
        };
    }

    async forgotPassword(email: string) {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            return;
        }

        await this.passwordResetRepository.invalidateAllForUser(user.id);

        // only the hash of the token is saved in the database
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
        await this.passwordResetRepository.create(user.id, hashToken(token), expiresAt);

        const resetUrl = (process.env.FRONTEND_URL || "http://localhost:4200") + "/reset-password?token=" + token;
        const text =
            "Hello " + user.firstName + ",\n\n" +
            "You asked to reset your password. Open this link (valid for 30 minutes):\n" +
            resetUrl + "\n\n" +
            "If you didn't ask for it, just ignore this email.";

        this.mailService
            .send(user.email, "Forgot Password - PantryDetails", text)
            .catch((error) => console.error("Failed to send reset email:", error));
    }

    async resetPassword(token: string, password: string) {
        const reset = await this.passwordResetRepository.findValidByTokenHash(hashToken(token));
        if (!reset) {
            return false;
        }

        const used = await this.passwordResetRepository.markAsUsed(reset.id);
        if (!used) {
            return false;
        }

        const passwordHash = await bcrypt.hash(password, 10);
        await this.userRepository.updatePassword(reset.userId, passwordHash);
        return true;
    }
}
