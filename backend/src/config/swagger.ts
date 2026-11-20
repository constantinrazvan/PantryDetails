function jsonBody(example: object) {
    return {
        required: true,
        content: { "application/json": { schema: { type: "object" }, example: example } },
    };
}

function idParam(name: string) {
    return { name: name, in: "path", required: true, schema: { type: "integer" } };
}

const ok = { 200: { description: "Success" } };
const created = { 201: { description: "Created" } };
const publicRoute: object[] = [];

const folderId = idParam("folderId");
const itemId = idParam("itemId");
const userId = idParam("userId");
const roleId = idParam("roleId");

export const swaggerDocument = {
    openapi: "3.0.3",
    info: {
        title: "PantryDetails API",
        version: "1.0.0",
        description: "Use POST /auth/login, copy the token, then press Authorize.",
    },
    servers: [{ url: "/api" }],
    components: {
        securitySchemes: {
            bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        },
    },
    security: [{ bearerAuth: [] }],
    paths: {
        "/auth/login": {
            post: {
                tags: ["Auth"],
                summary: "Login",
                security: publicRoute,
                requestBody: jsonBody({ email: "admin@pantrydetails.local", password: "Admin1234!" }),
                responses: ok,
            },
        },
        "/auth/forgot-password": {
            post: {
                tags: ["Auth"],
                summary: "Send a reset link by email",
                security: publicRoute,
                requestBody: jsonBody({ email: "admin@pantrydetails.local" }),
                responses: ok,
            },
        },
        "/auth/reset-password": {
            post: {
                tags: ["Auth"],
                summary: "Set a new password with the token from email",
                security: publicRoute,
                requestBody: jsonBody({ token: "token-from-email", password: "NewPassword1!" }),
                responses: ok,
            },
        },

        "/users/me": {
            get: { tags: ["My account"], summary: "Get my account", responses: ok },
            patch: {
                tags: ["My account"],
                summary: "Update my name",
                requestBody: jsonBody({ firstName: "Admin", lastName: "Pantry" }),
                responses: ok,
            },
        },
        "/users/me/email": {
            patch: {
                tags: ["My account"],
                summary: "Change my email",
                requestBody: jsonBody({ email: "new.email@example.com" }),
                responses: ok,
            },
        },
        "/users/me/password": {
            patch: {
                tags: ["My account"],
                summary: "Change my password (returns a new token)",
                requestBody: jsonBody({ oldPassword: "Admin1234!", newPassword: "NewPassword1!" }),
                responses: ok,
            },
        },

        "/users": {
            get: {
                tags: ["Members (admin)"],
                summary: "List members",
                parameters: [
                    { name: "search", in: "query", schema: { type: "string" } },
                    { name: "access", in: "query", schema: { type: "string", enum: ["admin", "member"] } },
                    { name: "role", in: "query", schema: { type: "string" }, description: "Role id or none" },
                    { name: "status", in: "query", schema: { type: "string", enum: ["active", "pending"] } },
                ],
                responses: ok,
            },
            post: {
                tags: ["Members (admin)"],
                summary: "Create a member (temporary password sent by email)",
                requestBody: jsonBody({
                    firstName: "John",
                    lastName: "Doe",
                    email: "john@example.com",
                    role: "user",
                    roleId: null,
                }),
                responses: created,
            },
        },
        "/users/{userId}": {
            patch: {
                tags: ["Members (admin)"],
                summary: "Change access or role",
                parameters: [userId],
                requestBody: jsonBody({ role: "admin", roleId: null }),
                responses: ok,
            },
            delete: {
                tags: ["Members (admin)"],
                summary: "Delete a member (the last admin cannot be deleted)",
                parameters: [userId],
                responses: ok,
            },
        },

        "/folders": {
            get: { tags: ["Vaults"], summary: "List my vaults", responses: ok },
            post: {
                tags: ["Vaults"],
                summary: "Create a vault (admin)",
                requestBody: jsonBody({ name: "Work", description: "Accounts from work" }),
                responses: created,
            },
        },
        "/folders/{folderId}": {
            get: { tags: ["Vaults"], summary: "Get a vault", parameters: [folderId], responses: ok },
            patch: {
                tags: ["Vaults"],
                summary: "Update a vault (admin)",
                parameters: [folderId],
                requestBody: jsonBody({ name: "Work", description: "Updated description" }),
                responses: ok,
            },
            delete: { tags: ["Vaults"], summary: "Delete a vault (admin)", parameters: [folderId], responses: ok },
        },
        "/folders/{folderId}/access": {
            get: { tags: ["Vaults"], summary: "List who has access (admin)", parameters: [folderId], responses: ok },
        },
        "/folders/{folderId}/access/{userId}": {
            put: {
                tags: ["Vaults"],
                summary: "Give access to a user (admin)",
                parameters: [folderId, userId],
                requestBody: jsonBody({ permission: "read" }),
                responses: ok,
            },
            delete: {
                tags: ["Vaults"],
                summary: "Remove access (admin)",
                parameters: [folderId, userId],
                responses: ok,
            },
        },

        "/folders/{folderId}/items": {
            get: {
                tags: ["Items"],
                summary: "List items",
                parameters: [folderId, { name: "q", in: "query", schema: { type: "string" } }],
                responses: ok,
            },
        },
        "/folders/{folderId}/items/notes": {
            post: {
                tags: ["Items"],
                summary: "Create a note",
                parameters: [folderId],
                requestBody: jsonBody({ title: "Wi-Fi", body: "Network: Home-5G" }),
                responses: created,
            },
        },
        "/folders/{folderId}/items/credentials": {
            post: {
                tags: ["Items"],
                summary: "Create a credential",
                parameters: [folderId],
                requestBody: jsonBody({
                    title: "GitLab",
                    username: "dev@example.com",
                    password: "Secret-123",
                    url: "https://gitlab.example.com",
                    notes: null,
                }),
                responses: created,
            },
        },
        "/folders/{folderId}/items/files": {
            post: {
                tags: ["Items"],
                summary: "Upload a file",
                parameters: [folderId],
                requestBody: {
                    required: true,
                    content: {
                        "multipart/form-data": {
                            schema: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    file: { type: "string", format: "binary" },
                                },
                                required: ["file"],
                            },
                        },
                    },
                },
                responses: created,
            },
        },
        "/folders/{folderId}/items/{itemId}": {
            get: { tags: ["Items"], summary: "Get an item", parameters: [folderId, itemId], responses: ok },
            patch: {
                tags: ["Items"],
                summary: "Update an item",
                parameters: [folderId, itemId],
                requestBody: jsonBody({ title: "GitLab", password: "New-Secret-456" }),
                responses: ok,
            },
            delete: { tags: ["Items"], summary: "Delete an item", parameters: [folderId, itemId], responses: ok },
        },
        "/folders/{folderId}/items/{itemId}/reveal": {
            post: {
                tags: ["Items"],
                summary: "Show the decrypted password or note",
                parameters: [folderId, itemId],
                responses: ok,
            },
        },
        "/folders/{folderId}/items/{itemId}/download": {
            get: { tags: ["Items"], summary: "Download a file", parameters: [folderId, itemId], responses: ok },
        },

        "/roles": {
            get: { tags: ["Roles (admin)"], summary: "List roles", responses: ok },
            post: {
                tags: ["Roles (admin)"],
                summary: "Create a role",
                requestBody: jsonBody({ name: "Developer", icon: "tools", canView: true, canEdit: true, canDelete: false }),
                responses: created,
            },
        },
        "/roles/icons": {
            get: { tags: ["Roles (admin)"], summary: "List the icons a role can use", responses: ok },
        },
        "/roles/{roleId}": {
            patch: {
                tags: ["Roles (admin)"],
                summary: "Update a role",
                parameters: [roleId],
                requestBody: jsonBody({ name: "Developer", icon: "tools", canView: true, canEdit: true, canDelete: true }),
                responses: ok,
            },
            delete: { tags: ["Roles (admin)"], summary: "Delete a role", parameters: [roleId], responses: ok },
        },

        "/settings/smtp": {
            get: { tags: ["Settings (admin)"], summary: "Get SMTP settings", responses: ok },
            put: {
                tags: ["Settings (admin)"],
                summary: "Save SMTP settings",
                requestBody: jsonBody({
                    host: "smtp.example.com",
                    port: 587,
                    secure: false,
                    user: "mailer@example.com",
                    from: "PantryDetails <mailer@example.com>",
                    password: "smtp-password",
                }),
                responses: ok,
            },
        },
        "/settings/smtp/test": {
            post: { tags: ["Settings (admin)"], summary: "Send a test email to me", responses: ok },
        },
        "/settings/demo-data": {
            get: { tags: ["Settings (admin)"], summary: "Check if demo data exists", responses: ok },
            post: { tags: ["Settings (admin)"], summary: "Import demo data", responses: ok },
            delete: {
                tags: ["Settings (admin)"],
                summary: "Delete demo vaults and the demo user (the admin stays)",
                responses: ok,
            },
        },

        "/stats": {
            get: { tags: ["Stats"], summary: "Dashboard stats", responses: ok },
        },
    },
};
