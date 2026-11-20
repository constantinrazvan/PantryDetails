import { Role } from './role';
import { UserRole } from './user-role';

export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  roleId: number | null;
  memberRole: Role | null;
  mustChangePassword: boolean;
  createdAt: string;
  updatedAt: string;
}
