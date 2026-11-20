import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { FolderPermission } from '../../models/folder-permission';
import { NavLink } from '../../models/nav-link';
import { AuthService } from '../../services/auth-service/auth-service';
import { FolderService } from '../../services/folder-service/folder-service';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-layout',
  styleUrl: './layout.css',
  templateUrl: './layout.html',
})
export class Layout implements OnInit, OnDestroy {
  private router = inject(Router);
  folderService = inject(FolderService);
  auth = inject(AuthService);
  FolderPermission = FolderPermission;

  vaultsRoute = '/dashboard/vaults';

  links: NavLink[] = [
    { href: '/dashboard', icon: 'bi-grid', label: 'Dashboard' },
    { href: '/dashboard/vaults', icon: 'bi-safe', label: 'Vaults' },
    { href: '/dashboard/members', icon: 'bi-people', label: 'Members', adminOnly: true },
    { href: '/dashboard/settings', icon: 'bi-gear', label: 'Settings', bottom: true },
    { href: '/dashboard/account', icon: 'bi-person', label: 'Account' },
  ];

  vaultsOpen = false;
  vaultSelected = false;
  private routerSub?: Subscription;

  ngOnInit(): void {
    this.checkUrl();
    this.routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) this.checkUrl();
    });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    this.folderService.reset();
  }

  loadVaults(): void {
    this.folderService.load();
  }

  private checkUrl(): void {
    const url = this.router.url.split('?')[0];
    this.vaultsOpen = url.startsWith(this.vaultsRoute);
    this.vaultSelected = url.startsWith(this.vaultsRoute + '/');
    if (this.vaultsOpen && this.folderService.vaults.length === 0) {
      this.folderService.load();
    }
  }
}
