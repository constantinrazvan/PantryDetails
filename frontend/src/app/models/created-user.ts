import { UserProfile } from './user-profile';

export interface CreatedUser {
  user: UserProfile;
  mailSent: boolean;
  temporaryPassword?: string;
}
