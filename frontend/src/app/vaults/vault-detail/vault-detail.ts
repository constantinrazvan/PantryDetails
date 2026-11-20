import { ChangeDetectionStrategy, Component, HostListener, Input, OnChanges, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ConfirmModal } from '../../components/confirm-modal/confirm-modal';
import { Folder } from '../../models/folder';
import { FolderPermission } from '../../models/folder-permission';
import { Item } from '../../models/item';
import { ItemType } from '../../models/item-type';
import { ApiErrorService } from '../../services/api-error-service/api-error-service';
import { AuthService } from '../../services/auth-service/auth-service';
import { FolderService } from '../../services/folder-service/folder-service';
import { ItemService } from '../../services/item-service/item-service';
import { ItemCard } from '../item-card/item-card';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink, ItemCard, ConfirmModal],
  selector: 'app-vault-detail',
  styleUrl: './vault-detail.css',
  templateUrl: './vault-detail.html',
})
export class VaultDetail implements OnChanges {
  private folderService = inject(FolderService);
  private itemService = inject(ItemService);
  private apiError = inject(ApiErrorService);
  private router = inject(Router);
  auth = inject(AuthService);

  FolderPermission = FolderPermission;

  @Input() id = '';

  folder: Folder | null = null;
  folderLoading = false;
  folderError = false;

  items: Item[] = [];
  itemsLoading = false;
  itemsError = false;

  addMenuOpen = false;
  addOptions = [
    { type: ItemType.CREDENTIAL, label: 'Password', icon: 'bi-key' },
    { type: ItemType.NOTE, label: 'Note', icon: 'bi-journal-text' },
    { type: ItemType.FILE, label: 'File', icon: 'bi-file-earmark-arrow-up' },
  ];

  search = '';
  typeFilter = 'all';
  filters = [
    { value: 'all', label: 'All', icon: 'bi-grid' },
    { value: ItemType.CREDENTIAL, label: 'Passwords', icon: 'bi-key' },
    { value: ItemType.NOTE, label: 'Notes', icon: 'bi-journal-text' },
    { value: ItemType.FILE, label: 'Files', icon: 'bi-file-earmark' },
  ];

  confirmDelete = false;
  deleting = false;
  deleteError = '';

  ngOnChanges(): void {
    this.loadFolder();
    this.loadItems();
  }

  @HostListener('document:click')
  closeAddMenu(): void {
    this.addMenuOpen = false;
  }

  loadFolder(): void {
    this.folderLoading = true;
    this.folderError = false;
    this.folderService.get(this.id).subscribe({
      next: (folder) => {
        this.folder = folder;
        this.folderLoading = false;
      },
      error: () => {
        this.folder = null;
        this.folderError = true;
        this.folderLoading = false;
      },
    });
  }

  loadItems(): void {
    this.itemsLoading = true;
    this.itemsError = false;
    this.itemService.list(this.id).subscribe({
      next: (items) => {
        this.items = items;
        this.itemsLoading = false;
      },
      error: () => {
        this.itemsError = true;
        this.itemsLoading = false;
      },
    });
  }

  canWrite(): boolean {
    return this.folder !== null && this.folder.permission === FolderPermission.WRITE;
  }

  canDelete(): boolean {
    return this.folder !== null && this.folder.canDelete;
  }

  visibleItems(): Item[] {
    const text = this.search.trim().toLowerCase();
    return this.items.filter((item) => {
      if (this.typeFilter !== 'all' && item.type !== this.typeFilter) return false;
      if (!text) return true;
      const title = item.title.toLowerCase();
      const username = (item.username ?? '').toLowerCase();
      const fileName = (item.originalName ?? '').toLowerCase();
      return title.includes(text) || username.includes(text) || fileName.includes(text);
    });
  }

  countOf(type: string): number {
    if (type === 'all') return this.items.length;
    return this.items.filter((item) => item.type === type).length;
  }

  toggleAddMenu(event: Event): void {
    event.stopPropagation();
    this.addMenuOpen = !this.addMenuOpen;
  }

  onItemDeleted(itemId: number): void {
    this.items = this.items.filter((item) => item.id !== itemId);
  }

  askDelete(): void {
    this.deleteError = '';
    this.confirmDelete = true;
  }

  deleteVault(): void {
    this.deleting = true;
    this.deleteError = '';
    this.folderService.delete(this.id).subscribe({
      next: () => {
        this.deleting = false;
        this.confirmDelete = false;
        this.folderService.load();
        this.router.navigate(['/dashboard/vaults']);
      },
      error: (err) => {
        this.deleting = false;
        this.deleteError = this.apiError.message(err, 'Could not delete the vault.');
      },
    });
  }
}
