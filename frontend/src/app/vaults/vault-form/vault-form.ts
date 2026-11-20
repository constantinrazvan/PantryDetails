import { ChangeDetectionStrategy, Component, Input, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiErrorService } from '../../services/api-error-service/api-error-service';
import { FolderService } from '../../services/folder-service/folder-service';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-vault-form',
  styleUrl: './vault-form.css',
  templateUrl: './vault-form.html',
})
export class VaultForm implements OnInit {
  private folderService = inject(FolderService);
  private apiError = inject(ApiErrorService);
  private router = inject(Router);

  @Input() id = '';

  form = inject(FormBuilder).nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    description: [''],
  });

  loading = false;
  saving = false;
  error = '';

  get isEdit(): boolean {
    return !!this.id;
  }

  ngOnInit(): void {
    if (!this.id) return;

    this.loading = true;
    this.folderService.get(this.id).subscribe({
      next: (folder) => {
        this.form.setValue({ name: folder.name, description: folder.description ?? '' });
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = this.apiError.message(err, 'The vault was not found.');
      },
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, description } = this.form.getRawValue();
    const data = { name: name.trim(), description: description.trim() || null };

    this.saving = true;
    this.error = '';

    let request = this.folderService.create(data);
    if (this.id) {
      request = this.folderService.update(this.id, data);
    }

    request.subscribe({
      next: (folder) => {
        this.folderService.load();
        this.router.navigate(['/dashboard/vaults', folder.id]);
      },
      error: (err) => {
        this.saving = false;
        this.error = this.apiError.message(err, 'Could not save the vault.');
      },
    });
  }

  invalid(control: 'name' | 'description'): boolean {
    const c = this.form.controls[control];
    return c.invalid && c.touched;
  }
}
