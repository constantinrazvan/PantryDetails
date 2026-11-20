export interface Role {
  id: number;
  name: string;
  icon: string;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  createdAt: string;
  updatedAt: string;
  userCount?: number;
}
