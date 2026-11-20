import { UserRole } from './user-role';

export interface CurrentUser {
  id: number;
  email: string;
  role: UserRole;
}
