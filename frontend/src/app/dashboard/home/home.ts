import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StatCard } from '../../components/stat-card/stat-card';
import { DashboardStats } from '../../models/dashboard-stats';
import { ItemType } from '../../models/item-type';
import { UserRole } from '../../models/user-role';
import { FileSizePipe } from '../../pipes/file-size-pipe';
import { AuthService } from '../../services/auth-service/auth-service';
import { StatsService } from '../../services/stats-service/stats-service';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [DatePipe, RouterLink, FileSizePipe, StatCard],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home implements OnInit {
  private statsService = inject(StatsService);
  auth = inject(AuthService);

  UserRole = UserRole;

  stats: DashboardStats | null = null;
  loading = false;
  error = false;

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.error = false;
    this.statsService.overview().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }

  typeLabel(type: ItemType): string {
    if (type === ItemType.CREDENTIAL) return 'Password';
    if (type === ItemType.NOTE) return 'Note';
    return 'File';
  }

  typeIcon(type: ItemType): string {
    if (type === ItemType.CREDENTIAL) return 'bi-key';
    if (type === ItemType.NOTE) return 'bi-journal-text';
    return 'bi-file-earmark';
  }

  typeColor(type: ItemType): string {
    if (type === ItemType.CREDENTIAL) return 'warning';
    if (type === ItemType.NOTE) return 'info';
    return 'success';
  }

  share(value: number, rows: { count: number }[]): number {
    let max = 1;
    for (const row of rows) {
      if (row.count > max) max = row.count;
    }
    return Math.round((value / max) * 100);
  }

  part(value: number, total: number): number {
    if (total === 0) return 0;
    return (value / total) * 100;
  }

  initials(user: { firstName: string; lastName: string }): string {
    return (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase();
  }
}
