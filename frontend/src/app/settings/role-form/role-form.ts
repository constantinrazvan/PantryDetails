import { ChangeDetectionStrategy, Component, Input, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiErrorService } from '../../services/api-error-service/api-error-service';
import { RoleService } from '../../services/role-service/role-service';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-role-form',
  styleUrl: './role-form.css',
  templateUrl: './role-form.html',
})
export class RoleForm implements OnInit {
  private roleService = inject(RoleService);
  private apiError = inject(ApiErrorService);
  private router = inject(Router);

  @Input() roleId = '';

  icons: string[] = [];
  loading = false;
  notFound = false;
  saving = false;
  error = '';

  form = inject(FormBuilder).nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(50)]],
    icon: ['person', Validators.required],
    canView: [true],
    canEdit: [false],
    canDelete: [false],
  });

  permissions = [
    { key: 'canView', label: 'Can view', hint: 'Sees the items in the vaults they can access.', icon: 'bi-eye' },
    { key: 'canEdit', label: 'Can edit', hint: 'Adds and edits passwords, notes and files.', icon: 'bi-pencil' },
    { key: 'canDelete', label: 'Can delete', hint: 'Deletes items from vaults.', icon: 'bi-trash' },
  ];

  get isEdit(): boolean {
    return !!this.roleId;
  }

  ngOnInit(): void {
    this.roleService.icons().subscribe((icons) => (this.icons = icons));

    if (this.roleId) {
      this.loading = true;
      this.roleService.list().subscribe({
        next: (roles) => {
          this.loading = false;
          const role = roles.find((r) => r.id === Number(this.roleId));
          if (role) {
            this.form.reset({
              name: role.name,
              icon: role.icon,
              canView: role.canView,
              canEdit: role.canEdit,
              canDelete: role.canDelete,
            });
          } else {
            this.notFound = true;
          }
        },
        error: () => {
          this.loading = false;
          this.notFound = true;
        },
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const data = this.form.getRawValue();
    data.name = data.name.trim();

    this.saving = true;
    this.error = '';

    let request = this.roleService.create(data);
    if (this.roleId) {
      request = this.roleService.update(Number(this.roleId), data);
    }

    request.subscribe({
      next: () => this.router.navigate(['/dashboard/settings']),
      error: (err) => {
        this.saving = false;
        if (err.status === 409) {
          this.error = 'A role with this name already exists.';
        } else {
          this.error = this.apiError.message(err, 'Could not save the role.');
        }
      },
    });
  }

  invalid(control: 'name' | 'icon'): boolean {
    const c = this.form.controls[control];
    return c.invalid && c.touched;
  }
}
