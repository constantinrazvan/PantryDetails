import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [],
  selector: 'app-vault-list',
  styleUrl: './vault-list.css',
  templateUrl: './vault-list.html',
})
export class VaultList {}
