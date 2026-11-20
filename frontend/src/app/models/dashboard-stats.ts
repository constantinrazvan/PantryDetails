import { ItemType } from './item-type';
import { UserRole } from './user-role';

export interface DashboardStats {
  totals: {
    vaults: number;
    items: number;
    credentials: number;
    notes: number;
    files: number;
    storageBytes: number;
    users: number | null;
  };
  fileTypes: { extension: string; count: number; bytes: number }[];
  vaults: { id: number; name: string; total: number; credentials: number; notes: number; files: number }[];
  recentItems: {
    id: number;
    title: string;
    type: ItemType;
    folderId: number;
    folderName: string;
    createdAt: string;
    createdBy: string | null;
  }[];
  users: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    memberRole: { name: string; icon: string } | null;
    mustChangePassword: boolean;
    itemsCreated: number;
    filesCreated: number;
    lastActivity: string | null;
    createdAt: string;
  }[];
}
