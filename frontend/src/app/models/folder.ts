import { FolderPermission } from './folder-permission';

export interface Folder {
  id: number;
  name: string;
  description: string | null;
  createdBy: number | null;
  createdAt: string;
  updatedAt: string;
  permission: FolderPermission;
  canEdit: boolean;
  canDelete: boolean;
}
