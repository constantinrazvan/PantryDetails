import { Service } from '@angular/core';

export const REVEAL_OPTIONS = [10, 30, 60];

@Service()
export class SettingsService {
  revealSeconds = Number(localStorage.getItem('pd_reveal_seconds')) || 30;

  setRevealSeconds(seconds: number): void {
    this.revealSeconds = seconds;
    localStorage.setItem('pd_reveal_seconds', String(seconds));
  }
}
