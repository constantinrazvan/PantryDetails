import { ChangeDetectionStrategy, Component, Input, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ItemType } from '../../models/item-type';
import { ApiErrorService } from '../../services/api-error-service/api-error-service';
import { ItemService } from '../../services/item-service/item-service';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-item-form',
  styleUrl: './item-form.css',
  templateUrl: './item-form.html',
})
export class ItemForm implements OnInit {
  private itemService = inject(ItemService);
  private apiError = inject(ApiErrorService);
  private router = inject(Router);

  ItemType = ItemType;

  @Input() id = '';
  @Input() itemId = '';
  @Input() type = '';

  itemType: ItemType | null = null;

  form = inject(FormBuilder).nonNullable.group({
    title: ['', Validators.maxLength(255)],
    body: [''],
    username: [''],
    password: [''],
    url: [''],
    notes: [''],
  });

  file: File | null = null;
  fileTouched = false;
  showPassword = false;

  loading = false;
  saving = false;
  error = '';

  get isEdit(): boolean {
    return !!this.itemId;
  }

  ngOnInit(): void {
    if (this.itemId) {
      this.loadItem();
      return;
    }

    if (this.type === ItemType.CREDENTIAL || this.type === ItemType.NOTE || this.type === ItemType.FILE) {
      this.setType(this.type);
    } else {
      this.error = 'Unknown item type.';
    }
  }

  heading(): string {
    if (this.itemType === ItemType.CREDENTIAL) return this.isEdit ? 'Edit password' : 'New password';
    if (this.itemType === ItemType.NOTE) return this.isEdit ? 'Edit note' : 'New note';
    if (this.itemType === ItemType.FILE) return this.isEdit ? 'Edit file' : 'New file';
    return this.isEdit ? 'Edit item' : 'New item';
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.file = input.files && input.files.length > 0 ? input.files[0] : null;
    this.fileTouched = true;
  }

  submit(): void {
    if (!this.itemType) return;

    const missingFile = this.itemType === ItemType.FILE && !this.isEdit && !this.file;
    if (this.form.invalid || missingFile) {
      this.form.markAllAsTouched();
      this.fileTouched = true;
      return;
    }

    this.saving = true;
    this.error = '';

    this.save().subscribe({
      next: () => this.router.navigate(['/dashboard/vaults', this.id]),
      error: (err) => {
        this.saving = false;
        if (err.status === 413) {
          this.error = 'The file is too large.';
        } else {
          this.error = this.apiError.message(err, 'Could not save the item.');
        }
      },
    });
  }

  invalid(control: 'title' | 'body' | 'username' | 'password' | 'url' | 'notes'): boolean {
    const c = this.form.controls[control];
    return c.invalid && c.touched;
  }

  private save() {
    const v = this.form.getRawValue();
    const title = v.title.trim();

    if (this.itemId) {
      const changes: any = { title };
      if (this.itemType === ItemType.NOTE) changes.body = v.body;
      if (this.itemType === ItemType.CREDENTIAL) {
        changes.username = v.username.trim();
        changes.url = v.url.trim() || null;
        changes.notes = v.notes.trim() || null;
        if (v.password) changes.password = v.password;
      }
      return this.itemService.update(this.id, this.itemId, changes);
    }

    if (this.itemType === ItemType.NOTE) {
      return this.itemService.createNote(this.id, { title, body: v.body });
    }

    if (this.itemType === ItemType.CREDENTIAL) {
      return this.itemService.createCredential(this.id, {
        title,
        username: v.username.trim(),
        password: v.password,
        url: v.url.trim() || null,
        notes: v.notes.trim() || null,
      });
    }

    return this.itemService.createFile(this.id, this.file!, title);
  }

  private loadItem(): void {
    this.loading = true;
    this.itemService.get(this.id, this.itemId).subscribe({
      next: (item) => {
        this.setType(item.type);
        this.form.patchValue({
          title: item.title,
          body: item.body ?? '',
          username: item.username ?? '',
          url: item.url ?? '',
          notes: item.notes ?? '',
        });
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = this.apiError.message(err, 'The item was not found.');
      },
    });
  }

  private setType(type: ItemType): void {
    this.itemType = type;
    const c = this.form.controls;

    if (type === ItemType.FILE) {
      c.title.setValidators([Validators.maxLength(255)]);
    } else {
      c.title.setValidators([Validators.required, Validators.maxLength(255)]);
    }

    if (type === ItemType.CREDENTIAL) {
      c.username.setValidators(Validators.required);
      if (!this.isEdit) c.password.setValidators(Validators.required);
    }

    c.title.updateValueAndValidity();
    c.username.updateValueAndValidity();
    c.password.updateValueAndValidity();
  }
}
