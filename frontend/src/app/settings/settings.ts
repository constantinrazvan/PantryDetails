import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ConfirmModal } from '../components/confirm-modal/confirm-modal';
import { Role } from '../models/role';
import { SmtpSettings } from '../models/smtp-settings';
import { ApiErrorService } from '../services/api-error-service/api-error-service';
import { AuthService } from '../services/auth-service/auth-service';
import { DemoDataService } from '../services/demo-data-service/demo-data-service';
import { FolderService } from '../services/folder-service/folder-service';
import { RoleService } from '../services/role-service/role-service';
import { REVEAL_OPTIONS, SettingsService } from '../services/settings-service/settings-service';
import { SmtpSettingsService } from '../services/smtp-settings-service/smtp-settings-service';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink, ReactiveFormsModule, ConfirmModal],
  selector: 'app-settings',
  styleUrl: './settings.css',
  templateUrl: './settings.html',
})
export class Settings implements OnInit {
  private roleService = inject(RoleService);
  private smtpService = inject(SmtpSettingsService);
  private apiError = inject(ApiErrorService);
  private demoDataService = inject(DemoDataService);
  private folderService = inject(FolderService);
  settings = inject(SettingsService);
  auth = inject(AuthService);

  revealOptions = REVEAL_OPTIONS;

  roles: Role[] = [];
  rolesLoading = false;
  rolesError = false;
  roleToDelete: Role | null = null;
  deleting = false;
  deleteError = '';

  smtp: SmtpSettings | null = null;
  smtpLoading = false;
  smtpForm = inject(FormBuilder).nonNullable.group({
    host: ['', [Validators.required, Validators.maxLength(255)]],
    port: [587, [Validators.required, Validators.min(1), Validators.max(65535)]],
    secure: [false],
    user: [''],
    password: [''],
    from: [''],
  });
  smtpSaving = false;
  smtpTesting = false;
  smtpMessage = '';
  smtpMessageType = 'success';
  showSmtpPassword = false;

  hasDemoData = false;
  demoBusy = false;
  demoMessage = '';
  demoMessageType = 'success';
  confirmDeleteDemo = false;

  ngOnInit(): void {
    if (this.auth.isAdmin()) {
      this.loadRoles();
      this.loadSmtp();
      this.loadDemoStatus();
    }
  }

  loadDemoStatus(): void {
    this.demoDataService.hasDemoData().subscribe((hasDemoData) => (this.hasDemoData = hasDemoData));
  }

  importDemo(): void {
    this.demoBusy = true;
    this.demoMessage = '';
    this.demoDataService.import().subscribe({
      next: () => {
        this.demoBusy = false;
        this.hasDemoData = true;
        this.demoMessageType = 'success';
        this.demoMessage = 'The demo data was imported.';
        this.folderService.load();
      },
      error: (err) => {
        this.demoBusy = false;
        this.demoMessageType = 'danger';
        this.demoMessage = this.apiError.message(err, 'Could not import the demo data.');
      },
    });
  }

  deleteDemo(): void {
    this.demoBusy = true;
    this.demoMessage = '';
    this.demoDataService.delete().subscribe({
      next: () => {
        this.demoBusy = false;
        this.confirmDeleteDemo = false;
        this.hasDemoData = false;
        this.demoMessageType = 'success';
        this.demoMessage = 'The demo data was deleted.';
        this.folderService.load();
      },
      error: (err) => {
        this.demoBusy = false;
        this.confirmDeleteDemo = false;
        this.demoMessageType = 'danger';
        this.demoMessage = this.apiError.message(err, 'Could not delete the demo data.');
      },
    });
  }

  changeRevealSeconds(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    this.settings.setRevealSeconds(value);
  }

  loadRoles(): void {
    this.rolesLoading = true;
    this.rolesError = false;
    this.roleService.list().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.rolesLoading = false;
      },
      error: () => {
        this.rolesError = true;
        this.rolesLoading = false;
      },
    });
  }

  loadSmtp(): void {
    this.smtpLoading = true;
    this.smtpService.get().subscribe({
      next: (smtp) => {
        this.setSmtp(smtp);
        this.smtpLoading = false;
      },
      error: () => (this.smtpLoading = false),
    });
  }

  saveSmtp(): void {
    if (this.smtpForm.invalid) {
      this.smtpForm.markAllAsTouched();
      return;
    }

    const v = this.smtpForm.getRawValue();
    const data: any = {
      host: v.host,
      port: Number(v.port),
      secure: v.secure,
      user: v.user,
      from: v.from,
    };
    if (v.password) data.password = v.password;

    this.smtpSaving = true;
    this.smtpMessage = '';
    this.smtpService.update(data).subscribe({
      next: (saved) => {
        this.smtpSaving = false;
        this.setSmtp(saved);
        this.showMessage('success', 'The SMTP settings were saved.');
      },
      error: (err) => {
        this.smtpSaving = false;
        this.showMessage('danger', this.apiError.message(err, 'Could not save the settings.'));
      },
    });
  }

  testSmtp(): void {
    this.smtpTesting = true;
    this.smtpMessage = '';
    this.smtpService.test().subscribe({
      next: () => {
        this.smtpTesting = false;
        this.showMessage('success', 'Test email sent to ' + this.auth.user()?.email + '.');
      },
      error: (err) => {
        this.smtpTesting = false;
        this.showMessage('danger', this.apiError.message(err, 'The test failed.'));
      },
    });
  }

  smtpInvalid(control: 'host' | 'port'): boolean {
    const c = this.smtpForm.controls[control];
    return c.invalid && c.touched;
  }

  askDeleteRole(role: Role): void {
    this.deleteError = '';
    this.roleToDelete = role;
  }

  deleteRole(): void {
    if (!this.roleToDelete) return;

    this.deleting = true;
    this.deleteError = '';
    this.roleService.delete(this.roleToDelete.id).subscribe({
      next: () => {
        this.deleting = false;
        this.roleToDelete = null;
        this.loadRoles();
      },
      error: (err) => {
        this.deleting = false;
        this.deleteError = this.apiError.message(err, 'Could not delete the role.');
      },
    });
  }

  private setSmtp(smtp: SmtpSettings): void {
    this.smtp = smtp;
    this.smtpForm.reset({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      user: smtp.user,
      password: '',
      from: smtp.from,
    });
  }

  private showMessage(type: string, text: string): void {
    this.smtpMessageType = type;
    this.smtpMessage = text;
  }
}
