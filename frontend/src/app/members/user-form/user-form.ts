import { ChangeDetectionStrategy, Component, Input, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CreatedUser } from '../../models/created-user';
import { Role } from '../../models/role';
import { UserRole } from '../../models/user-role';
import { ApiErrorService } from '../../services/api-error-service/api-error-service';
import { RoleService } from '../../services/role-service/role-service';
import { UserService } from '../../services/user-service/user-service';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-user-form',
  styleUrl: './user-form.css',
  templateUrl: './user-form.html',
})
export class UserForm implements OnInit {
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private apiError = inject(ApiErrorService);
  private router = inject(Router);

  UserRole = UserRole;

  @Input() userId = '';

  roles: Role[] = [];
  loading = false;
  notFound = false;
  saving = false;
  error = '';
  created: CreatedUser | null = null;
  copied = false;

  form = inject(FormBuilder).nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    role: [UserRole.USER],
    roleId: [null as number | null],
  });

  get isEdit(): boolean {
    return !!this.userId;
  }

  ngOnInit(): void {
    this.roleService.list().subscribe((roles) => (this.roles = roles));

    if (this.userId) {
      this.loadMember();
    }
  }

  loadMember(): void {
    this.loading = true;
    this.userService.list().subscribe({
      next: (users) => {
        this.loading = false;
        const member = users.find((user) => user.id === Number(this.userId));
        if (!member) {
          this.notFound = true;
          return;
        }
        this.form.reset({
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email,
          role: member.role,
          roleId: member.roleId,
        });
        this.form.controls.firstName.disable();
        this.form.controls.lastName.disable();
        this.form.controls.email.disable();
      },
      error: () => {
        this.loading = false;
        this.notFound = true;
      },
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    this.saving = true;
    this.error = '';

    if (this.userId) {
      this.userService.update(Number(this.userId), { role: v.role, roleId: v.roleId }).subscribe({
        next: () => this.router.navigate(['/dashboard/members']),
        error: (err) => {
          this.saving = false;
          this.error = this.apiError.message(err, 'Could not save the member.');
        },
      });
      return;
    }

    const data = {
      firstName: v.firstName.trim(),
      lastName: v.lastName.trim(),
      email: v.email.trim(),
      role: v.role,
      roleId: v.roleId,
    };

    this.userService.create(data).subscribe({
      next: (result) => {
        if (result.mailSent) {
          this.router.navigate(['/dashboard/members']);
        } else {
          this.saving = false;
          this.created = result;
        }
      },
      error: (err) => {
        this.saving = false;
        if (err.status === 409) {
          this.error = 'An account with this email already exists.';
        } else {
          this.error = this.apiError.message(err, 'Could not add the member.');
        }
      },
    });
  }

  copyPassword(password: string): void {
    navigator.clipboard.writeText(password).then(() => {
      this.copied = true;
      setTimeout(() => (this.copied = false), 2000);
    });
  }

  invalid(control: 'firstName' | 'lastName' | 'email'): boolean {
    const c = this.form.controls[control];
    return c.invalid && c.touched;
  }
}
