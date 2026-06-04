import { effect, inject, Injectable, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);

  readonly isDark = signal(this.resolveInitialTheme());

  constructor() {
    effect(() => {
      const dark = this.isDark();
      this.doc.documentElement.classList.toggle('light', !dark);
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    });
  }

  toggle(): void {
    this.isDark.update(dark => !dark);
  }

  private resolveInitialTheme(): boolean {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return !(window.matchMedia?.('(prefers-color-scheme: light)').matches ?? false);
  }
}
