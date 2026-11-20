import { Router } from "express";
import { FolderController } from "../controllers/folder.controller";
import { ItemController } from "../controllers/item.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middlware";
import { loadFolderAccess, requireFolderDelete, requireFolderWrite } from "../middleware/folder-access.middleware";
import { uploadSingleFile } from "../middleware/upload.middleware";
import { UserRole } from "../models/enums/user-role.enum";

const folderController = new FolderController();
const itemController = new ItemController();
const adminOnly = requireRole(UserRole.ADMIN);

const folderRouter = Router();
folderRouter.use(authenticate);

folderRouter.get("/", folderController.list);
folderRouter.post("/", adminOnly, folderController.create);

folderRouter.get("/:folderId", loadFolderAccess, folderController.get);
folderRouter.patch("/:folderId", loadFolderAccess, adminOnly, folderController.update);
folderRouter.delete("/:folderId", loadFolderAccess, adminOnly, folderController.delete);

folderRouter.get("/:folderId/access", loadFolderAccess, adminOnly, folderController.listAccess);
folderRouter.put("/:folderId/access/:userId", loadFolderAccess, adminOnly, folderController.grantAccess);
folderRouter.delete("/:folderId/access/:userId", loadFolderAccess, adminOnly, folderController.revokeAccess);

folderRouter.get("/:folderId/items", loadFolderAccess, itemController.list);
folderRouter.post("/:folderId/items/notes", loadFolderAccess, requireFolderWrite, itemController.createNote);
folderRouter.post("/:folderId/items/credentials", loadFolderAccess, requireFolderWrite, itemController.createCredential);
folderRouter.post("/:folderId/items/files", loadFolderAccess, requireFolderWrite, uploadSingleFile, itemController.createFile);
folderRouter.get("/:folderId/items/:itemId", loadFolderAccess, itemController.get);
folderRouter.patch("/:folderId/items/:itemId", loadFolderAccess, requireFolderWrite, itemController.update);
folderRouter.delete("/:folderId/items/:itemId", loadFolderAccess, requireFolderDelete, itemController.delete);
folderRouter.post("/:folderId/items/:itemId/reveal", loadFolderAccess, itemController.reveal);
folderRouter.get("/:folderId/items/:itemId/download", loadFolderAccess, itemController.download);

export default folderRouter;
