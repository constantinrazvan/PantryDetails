import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, Output, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConfirmModal } from '../../components/confirm-modal/confirm-modal';
import { Item } from '../../models/item';
import { ItemType } from '../../models/item-type';
import { ApiErrorService } from '../../services/api-error-service/api-error-service';
import { ItemService } from '../../services/item-service/item-service';
import { SettingsService } from '../../services/settings-service/settings-service';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [DatePipe, DecimalPipe, RouterLink, ConfirmModal],
  selector: 'app-item-card',
  styleUrl: './item-card.css',
  templateUrl: './item-card.html',
})
export class ItemCard implements OnDestroy {
  private itemService = inject(ItemService);
  private apiError = inject(ApiErrorService);
  settings = inject(SettingsService);

  ItemType = ItemType;

  @Input() folderId: number | string = '';
  @Input() item!: Item;
  @Input() canWrite = false;
  @Input() canDelete = false;

  @Output() deleted = new EventEmitter<number>();

  confirmDelete = false;
  deleting = false;
  deleteError = '';

  open = false;
  detail: Item | null = null;
  loading = false;
  error = '';

  password: string | null = null;
  revealing = false;
  downloading = false;
  copied = '';

  private hideTimer: any;
  private copiedTimer: any;

  ngOnDestroy(): void {
    clearTimeout(this.hideTimer);
    clearTimeout(this.copiedTimer);
  }

  icon(): string {
    if (this.item.type === ItemType.CREDENTIAL) return 'bi-key';
    if (this.item.type === ItemType.NOTE) return 'bi-journal-text';
    return 'bi-file-earmark';
  }

  cardClass(): string {
    if (this.item.type === ItemType.CREDENTIAL) return 'card border-0 text-white overflow-hidden bg-warning';
    if (this.item.type === ItemType.NOTE) return 'card border-0 text-white overflow-hidden bg-info';
    return 'card border-0 text-white overflow-hidden bg-success';
  }

  subtitle(): string {
    if (this.item.type === ItemType.CREDENTIAL) return this.item.username ?? '';
    if (this.item.type === ItemType.FILE) return this.item.originalName ?? '';
    return 'Note';
  }

  toggle(): void {
    this.open = !this.open;
    if (!this.open) {
      this.hidePassword();
      return;
    }
    if (this.item.type !== ItemType.FILE && !this.detail) this.loadDetail();
  }

  loadDetail(): void {
    this.loading = true;
    this.error = '';
    this.itemService.get(this.folderId, this.item.id).subscribe({
      next: (item) => {
        this.detail = item;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = this.apiError.message(err, 'Could not load the item');
      },
    });
  }

  togglePassword(): void {
    if (this.password !== null) {
      this.hidePassword();
      return;
    }
    this.revealing = true;
    this.itemService.reveal(this.folderId, this.item.id).subscribe({
      next: (password) => {
        this.revealing = false;
        this.password = password;
        clearTimeout(this.hideTimer);
        this.hideTimer = setTimeout(() => this.hidePassword(), this.settings.revealSeconds * 1000);
      },
      error: (err) => {
        this.revealing = false;
        this.error = this.apiError.message(err, 'Could not show the password');
      },
    });
  }

  copyPassword(): void {
    if (this.password !== null) {
      this.copy(this.password, 'password');
      return;
    }
    this.itemService.reveal(this.folderId, this.item.id).subscribe({
      next: (password) => this.copy(password, 'password'),
      error: (err) => (this.error = this.apiError.message(err, 'Could not copy the password')),
    });
  }

  copy(value: string | null | undefined, key: string): void {
    if (!value) return;
    navigator.clipboard.writeText(value).then(
      () => {
        this.copied = key;
        clearTimeout(this.copiedTimer);
        this.copiedTimer = setTimeout(() => (this.copied = ''), 1500);
      },
      () => (this.error = 'Could not copy to the clipboard'),
    );
  }

  download(): void {
    this.downloading = true;
    this.itemService.download(this.folderId, this.item.id).subscribe({
      next: (blob) => {
        this.downloading = false;

        let fileName = this.item.title + '.txt';
        if (this.item.originalName) {
          fileName = this.item.originalName;
        }

        // create a temporary link and click it to start the download
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      },
      error: (err) => {
        this.downloading = false;
        this.error = this.apiError.message(err, 'Could not download the file');
      },
    });
  }

  askDelete(): void {
    this.deleteError = '';
    this.confirmDelete = true;
  }

  delete(): void {
    this.deleting = true;
    this.deleteError = '';
    this.itemService.delete(this.folderId, this.item.id).subscribe({
      next: () => {
        this.deleting = false;
        this.confirmDelete = false;
        this.deleted.emit(this.item.id);
      },
      error: (err) => {
        this.deleting = false;
        this.deleteError = this.apiError.message(err, 'Could not delete the item.');
      },
    });
  }

  private hidePassword(): void {
    clearTimeout(this.hideTimer);
    this.password = null;
  }
}
