import "dotenv/config";
import bcrypt from "bcrypt";
import { AppDataSource } from "../config/data-source";
import { UserRole } from "../models/enums/user-role.enum";
import { UserRepository } from "../repositories/user.repository";

const users = [
    {
        firstName: "Admin",
        lastName: "Pantry",
        email: "admin@pantrydetails.local",
        password: process.env.SEED_ADMIN_PASSWORD || "Admin1234!",
        role: UserRole.ADMIN,
    },
    {
        firstName: "User",
        lastName: "Pantry",
        email: "user@pantrydetails.local",
        password: process.env.SEED_USER_PASSWORD || "User1234!",
        role: UserRole.USER,
    },
];

async function seedUsers() {
    await AppDataSource.initialize();
    const userRepository = new UserRepository();

    for (const user of users) {
        const existing = await userRepository.findByEmail(user.email);
        if (existing) {
            console.log("- " + user.email + " already exists");
            continue;
        }

        await userRepository.create({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            password: await bcrypt.hash(user.password, 10),
            role: user.role,
            roleId: null,
            mustChangePassword: false,
        });
        console.log("+ " + user.email + " / password: " + user.password);
    }

    await AppDataSource.destroy();
}

seedUsers();
