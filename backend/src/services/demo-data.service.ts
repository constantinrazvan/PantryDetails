import { FolderPermission } from "../models/enums/folder-permission.enum";
import { FolderAccessRepository } from "../repositories/folder-access.repository";
import { FolderRepository } from "../repositories/folder.repository";
import { UserRepository } from "../repositories/user.repository";
import { FolderService } from "./folder.service";
import { CredentialInput, ItemService, NoteInput } from "./item.service";

interface DemoFolder {
    name: string;
    description: string;
    userPermission: FolderPermission | null;
    notes: NoteInput[];
    credentials: CredentialInput[];
    files: { title: string; originalName: string; mimeType: string; content: string }[];
}

const DEMO_FOLDERS: DemoFolder[] = [
    {
        name: "Personal",
        description: "Only for the admin",
        userPermission: null,
        notes: [{ title: "Gift ideas", body: "- a book for mom\n- headphones for Andrew" }],
        credentials: [
            {
                title: "Personal email",
                username: "admin.personal@example.com",
                password: "Demo-Personal-123",
                url: "https://mail.example.com",
                notes: null,
            },
        ],
        files: [],
    },
    {
        name: "Work",
        description: "Accounts and notes from work",
        userPermission: FolderPermission.WRITE,
        notes: [
            {
                title: "Onboarding",
                body: "1. Ask for VPN access\n2. Install Docker\n3. Clone the repos from GitLab",
            },
        ],
        credentials: [
            {
                title: "GitLab",
                username: "dev@example.com",
                password: "Demo-GitLab-456",
                url: "https://gitlab.example.com",
                notes: "2FA on the work phone",
            },
            {
                title: "Staging DB",
                username: "staging_ro",
                password: "Demo-Staging-789",
                url: null,
                notes: "Read only",
            },
        ],
        files: [
            {
                title: "Team contacts",
                originalName: "contacts.txt",
                mimeType: "text/plain",
                content: "Ana - PM - 0700 000 001\nMihai - DevOps - 0700 000 002\n",
            },
        ],
    },
    {
        name: "Family",
        description: "Shared with the family (read only for user)",
        userPermission: FolderPermission.READ,
        notes: [{ title: "Home Wi-Fi", body: "Network: Home-5G\nThe password is on the router, under the label." }],
        credentials: [
            {
                title: "Netflix",
                username: "familia@example.com",
                password: "Demo-Netflix-000",
                url: "https://netflix.com",
                notes: null,
            },
        ],
        files: [],
    },
    {
        name: "Finance",
        description: "Bills and subscriptions",
        userPermission: FolderPermission.READ,
        notes: [{ title: "Due dates", body: "Electricity: the 15th\nInternet: the 20th\nRent: the 1st" }],
        credentials: [],
        files: [],
    },
];

export class DemoDataService {
    private itemService = new ItemService();
    private folderService = new FolderService();
    private folderRepository = new FolderRepository();
    private folderAccessRepository = new FolderAccessRepository();
    private userRepository = new UserRepository();

    async hasDemoData() {
        const folders = await this.folderRepository.findDemo();
        return folders.length > 0;
    }

    async importData(adminId: number) {
        // the demo data is imported only once
        if (await this.hasDemoData()) {
            return { created: 0 };
        }

        const demoUser = await this.userRepository.findByEmail("user@pantrydetails.local");
        let created = 0;

        for (const demo of DEMO_FOLDERS) {
            const folder = await this.folderRepository.create({
                name: demo.name,
                description: demo.description,
                createdBy: adminId,
                isDemo: true,
            });

            if (demoUser && demo.userPermission) {
                await this.folderAccessRepository.save(folder.id, demoUser.id, demo.userPermission);
            }

            for (const note of demo.notes) {
                await this.itemService.createNote(folder.id, adminId, note);
            }
            for (const credential of demo.credentials) {
                await this.itemService.createCredential(folder.id, adminId, credential);
            }
            for (const file of demo.files) {
                await this.itemService.createFile(folder.id, adminId, {
                    title: file.title,
                    originalName: file.originalName,
                    mimeType: file.mimeType,
                    buffer: Buffer.from(file.content, "utf8"),
                });
            }

            created++;
        }

        return { created };
    }

    async deleteData() {
        const folders = await this.folderRepository.findDemo();

        for (const folder of folders) {
            await this.folderService.delete(folder.id);
        }

        // the demo admin stays, it can be deleted later from Members
        const demoUser = await this.userRepository.findByEmail("user@pantrydetails.local");
        if (demoUser) {
            await this.userRepository.delete(demoUser.id);
        }

        return { deleted: folders.length };
    }
}
