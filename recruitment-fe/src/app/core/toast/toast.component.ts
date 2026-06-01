import { Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="toast-container">
      @for (t of toastSvc.toasts(); track t.id) {
        <div class="toast" [class]="'toast-' + t.type">
          <span class="toast-msg">{{ t.message }}</span>
          <button class="toast-dismiss" (click)="toastSvc.dismiss(t.id)" aria-label="Dismiss">×</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed; bottom: 24px; right: 24px;
      display: flex; flex-direction: column; gap: 8px;
      z-index: 9999; max-width: 380px; pointer-events: none;
    }
    .toast {
      display: flex; align-items: center; gap: 12px;
      padding: 11px 16px; border-radius: 8px;
      font-size: 13px; font-weight: 500;
      box-shadow: 0 4px 20px rgba(0,0,0,0.35);
      animation: toast-in 180ms ease;
      pointer-events: all;
    }
    .toast-msg { flex: 1; }
    .toast-info    { background: var(--info-subtle);    color: var(--info);    border: 1px solid rgba(59,130,246,.25); }
    .toast-warning { background: var(--warning-subtle); color: var(--warning); border: 1px solid rgba(245,158,11,.25); }
    .toast-error   { background: var(--danger-subtle);  color: var(--danger);  border: 1px solid rgba(239,68,68,.25); }
    .toast-success { background: var(--success-subtle); color: var(--success); border: 1px solid rgba(16,185,129,.25); }
    .toast-dismiss {
      background: none; border: none; cursor: pointer;
      font-size: 17px; line-height: 1; padding: 0 2px;
      color: inherit; opacity: 0.5; flex-shrink: 0;
      transition: opacity 120ms;
    }
    .toast-dismiss:hover { opacity: 1; }
    @keyframes toast-in {
      from { transform: translateX(110%); opacity: 0; }
      to   { transform: translateX(0);   opacity: 1; }
    }
  `],
})
export class ToastComponent {
  readonly toastSvc = inject(ToastService);
}
