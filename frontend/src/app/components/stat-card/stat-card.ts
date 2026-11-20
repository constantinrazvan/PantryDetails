import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink],
  selector: 'app-stat-card',
  styleUrl: './stat-card.css',
  templateUrl: './stat-card.html',
})
export class StatCard {
  @Input() label = '';
  @Input() value = 0;
  @Input() icon = '';
  @Input() color = '';
  @Input() link = '';
}
