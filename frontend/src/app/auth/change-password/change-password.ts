import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiErrorService } from '../../services/api-error-service/api-error-service';
import { AuthService } from '../../services/auth-service/auth-service';
import { UserService } from '../../services/user-service/user-service';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ReactiveFormsModule],
  selector: 'app-change-password',
  styleUrl: './change-password.css',
  templateUrl: './change-password.html',
})
export class ChangePassword {
  private userService = inject(UserService);
  private apiError = inject(ApiErrorService);
  private router = inject(Router);
  auth = inject(AuthService);

  form = inject(FormBuilder).nonNullable.group({
    oldPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  });

  saving = false;
  error = '';
  showPasswords = false;

  submit(): void {
    if (this.form.invalid || this.mismatch()) {
      this.form.markAllAsTouched();
      return;
    }

    const { oldPassword, newPassword } = this.form.getRawValue();
    this.saving = true;
    this.error = '';

    this.userService.changePassword(oldPassword, newPassword).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.saving = false;
        this.error = this.apiError.message(err, 'Could not change the password.');
      },
    });
  }

  invalid(control: 'oldPassword' | 'newPassword' | 'confirmPassword'): boolean {
    const c = this.form.controls[control];
    return c.invalid && c.touched;
  }

  mismatch(): boolean {
    const { newPassword, confirmPassword } = this.form.getRawValue();
    return confirmPassword !== '' && newPassword !== confirmPassword;
  }
}
