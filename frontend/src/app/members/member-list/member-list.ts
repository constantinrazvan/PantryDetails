import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ConfirmModal } from '../../components/confirm-modal/confirm-modal';
import { Role } from '../../models/role';
import { UserProfile } from '../../models/user-profile';
import { UserRole } from '../../models/user-role';
import { ApiErrorService } from '../../services/api-error-service/api-error-service';
import { AuthService } from '../../services/auth-service/auth-service';
import { RoleService } from '../../services/role-service/role-service';
import { UserService } from '../../services/user-service/user-service';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [DatePipe, RouterLink, ReactiveFormsModule, ConfirmModal],
  selector: 'app-member-list',
  styleUrl: './member-list.css',
  templateUrl: './member-list.html',
})
export class MemberList implements OnInit {
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private apiError = inject(ApiErrorService);
  auth = inject(AuthService);

  UserRole = UserRole;

  filters = inject(FormBuilder).nonNullable.group({
    search: [''],
    access: [''],
    role: [''],
    status: [''],
  });

  users: UserProfile[] = [];
  roles: Role[] = [];
  loading = false;
  error = '';
  filtered = false;

  userToDelete: UserProfile | null = null;
  deleting = false;
  deleteError = '';

  ngOnInit(): void {
    this.roleService.list().subscribe((roles) => (this.roles = roles));
    this.search();
  }

  search(): void {
    const v = this.filters.getRawValue();
    const search = v.search.trim();

    this.filtered = search !== '' || v.access !== '' || v.role !== '' || v.status !== '';
    this.loading = true;
    this.error = '';
    this.userService.search(search, v.access, v.role, v.status).subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = this.apiError.message(err, 'Could not load the members.');
      },
    });
  }

  showReset(): boolean {
    const v = this.filters.getRawValue();
    return this.filtered || v.search.trim() !== '' || v.access !== '' || v.role !== '' || v.status !== '';
  }

  reset(): void {
    this.filters.reset();
    this.search();
  }

  initials(user: UserProfile): string {
    return (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase();
  }

  askDelete(user: UserProfile): void {
    this.deleteError = '';
    this.userToDelete = user;
  }

  delete(): void {
    if (!this.userToDelete) return;
    const id = this.userToDelete.id;

    this.deleting = true;
    this.deleteError = '';
    this.userService.delete(id).subscribe({
      next: () => {
        this.deleting = false;
        this.userToDelete = null;
        this.users = this.users.filter((u) => u.id !== id);
      },
      error: (err) => {
        this.deleting = false;
        this.deleteError = this.apiError.message(err, 'Could not delete the member.');
      },
    });
  }
}
