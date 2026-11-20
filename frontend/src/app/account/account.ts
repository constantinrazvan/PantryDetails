import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmModal } from '../components/confirm-modal/confirm-modal';
import { UserProfile } from '../models/user-profile';
import { UserRole } from '../models/user-role';
import { ApiErrorService } from '../services/api-error-service/api-error-service';
import { AuthService } from '../services/auth-service/auth-service';
import { UserService } from '../services/user-service/user-service';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [DatePipe, ReactiveFormsModule, ConfirmModal],
  selector: 'app-account',
  styleUrl: './account.css',
  templateUrl: './account.html',
})
export class Account implements OnInit {
  private userService = inject(UserService);
  private apiError = inject(ApiErrorService);
  private fb = inject(FormBuilder).nonNullable;
  auth = inject(AuthService);

  UserRole = UserRole;

  user: UserProfile | null = null;
  loading = true;
  loadError = false;

  profileForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
  });
  editingProfile = false;
  profileSaving = false;
  profileError = '';
  profileSuccess = '';

  emailForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });
  emailSaving = false;
  emailError = '';
  emailSuccess = '';

  passwordForm = this.fb.group({
    oldPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  });
  passwordSaving = false;
  passwordError = '';
  passwordSuccess = '';
  showPasswords = false;

  confirmLogout = false;

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser(): void {
    this.loading = true;
    this.loadError = false;
    this.userService.me().subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
      },
      error: () => {
        this.loadError = true;
        this.loading = false;
      },
    });
  }

  initials(): string {
    if (!this.user) return '';
    return (this.user.firstName.charAt(0) + this.user.lastName.charAt(0)).toUpperCase();
  }

  startEditProfile(): void {
    if (!this.user) return;
    this.profileForm.reset({ firstName: this.user.firstName, lastName: this.user.lastName });
    this.profileError = '';
    this.profileSuccess = '';
    this.editingProfile = true;
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const { firstName, lastName } = this.profileForm.getRawValue();
    this.profileSaving = true;
    this.profileError = '';

    this.userService.updateProfile(firstName.trim(), lastName.trim()).subscribe({
      next: (user) => {
        this.profileSaving = false;
        this.user = user;
        this.editingProfile = false;
        this.profileSuccess = 'Your name was updated.';
      },
      error: (err) => {
        this.profileSaving = false;
        this.profileError = this.apiError.message(err, 'Could not save your name.');
      },
    });
  }

  changeEmail(): void {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    this.emailSaving = true;
    this.emailError = '';
    this.emailSuccess = '';

    this.userService.changeEmail(this.emailForm.getRawValue().email.trim()).subscribe({
      next: (user) => {
        this.emailSaving = false;
        this.user = user;
        this.emailForm.reset();
        this.emailSuccess = 'Your email was changed to ' + user.email + '.';
      },
      error: (err) => {
        this.emailSaving = false;
        this.emailError = this.apiError.message(err, 'Could not change your email.');
      },
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid || this.mismatch()) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { oldPassword, newPassword } = this.passwordForm.getRawValue();
    this.passwordSaving = true;
    this.passwordError = '';
    this.passwordSuccess = '';

    this.userService.changePassword(oldPassword, newPassword).subscribe({
      next: () => {
        this.passwordSaving = false;
        this.passwordForm.reset();
        this.passwordSuccess = 'Your password was changed.';
      },
      error: (err) => {
        this.passwordSaving = false;
        this.passwordError = this.apiError.message(err, 'Could not change your password.');
      },
    });
  }

  invalid(form: 'profile' | 'email' | 'password', control: string): boolean {
    let c;
    if (form === 'profile') c = this.profileForm.get(control);
    else if (form === 'email') c = this.emailForm.get(control);
    else c = this.passwordForm.get(control);
    return !!c && c.invalid && c.touched;
  }

  mismatch(): boolean {
    const { newPassword, confirmPassword } = this.passwordForm.getRawValue();
    return confirmPassword !== '' && newPassword !== confirmPassword;
  }
}
