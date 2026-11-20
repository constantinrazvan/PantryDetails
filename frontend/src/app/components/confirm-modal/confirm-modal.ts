import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [],
  selector: 'app-confirm-modal',
  styleUrl: './confirm-modal.css',
  templateUrl: './confirm-modal.html',
})
export class ConfirmModal {
  @Input() title = 'Confirm';
  @Input() message = '';
  @Input() confirmLabel = 'Delete';
  @Input() confirmClass = 'btn-danger';
  @Input() busy = false;
  @Input() error: string | null = null;

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  cancel(): void {
    if (!this.busy) this.cancelled.emit();
  }
}
