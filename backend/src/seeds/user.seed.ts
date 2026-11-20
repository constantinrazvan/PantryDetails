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
];

async function seedUsers() {
    await AppDataSource.initialize();
    const userRepository = new UserRepository();

    const existingUsers = await userRepository.findAll();
    if (existingUsers.length > 0) {
        console.log("Users already exist, nothing to seed");
        await AppDataSource.destroy();
        return;
    }

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
