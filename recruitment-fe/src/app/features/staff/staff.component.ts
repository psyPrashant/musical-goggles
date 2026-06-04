import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { StaffService } from '../../core/staff/staff.service';
import { StaffMember, StaffRequest, StaffRole } from '../../core/staff/staff.model';

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Staff</h1>
          <span class="page-sub">{{ filtered().length }} members</span>
        </div>
        <button class="btn btn-primary" (click)="openCreate()">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Staff
        </button>
      </div>

      <div class="content">
        <div class="filter-row">
          <div class="search-wrap">
            <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input class="search-input" [value]="search()" (input)="search.set($any($event.target).value)" placeholder="Search by name or email…"/>
          </div>
        </div>

        @if (filtered().length === 0) {
          <div class="empty-state">No staff members found.</div>
        } @else {
          <div class="staff-table">
            <div class="table-header">
              <span>Name</span>
              <span>Email</span>
              <span>Role</span>
              <span>Added</span>
              <span></span>
            </div>
            @for (m of filtered(); track m.id) {
              <div class="table-row">
                <div class="member-cell">
                  <div class="avatar" [style.background]="avatarColor(m.firstName + ' ' + m.lastName)">
                    {{ initials(m.firstName, m.lastName) }}
                  </div>
                  <span class="member-name">{{ m.firstName }} {{ m.lastName }}</span>
                </div>
                <div class="email-cell">{{ m.email }}</div>
                <div class="role-cell">
                  <span class="role-badge" [class.role-admin]="m.role === 'ADMIN'" [class.role-recruiter]="m.role === 'RECRUITER'">
                    {{ m.role === 'ADMIN' ? 'Admin' : 'Recruiter' }}
                  </span>
                </div>
                <div class="date-cell">{{ m.createdAt | date:'dd MMM yyyy' }}</div>
                <div class="actions-cell">
                  <button class="action-btn" title="Edit" (click)="openEdit(m)">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>

    @if (showDialog()) {
      <div class="overlay" (click)="closeDialog()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <span class="modal-title">{{ editTarget() ? 'Edit Staff Member' : 'Add Staff Member' }}</span>
            <button class="modal-close" (click)="closeDialog()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="field">
              <label class="field-label">First Name <span class="required">*</span></label>
              <input type="text" class="field-input" [value]="dFirst()" (input)="dFirst.set($any($event.target).value)" placeholder="Jane" />
            </div>
            <div class="field">
              <label class="field-label">Last Name <span class="required">*</span></label>
              <input type="text" class="field-input" [value]="dLast()" (input)="dLast.set($any($event.target).value)" placeholder="Smith" />
            </div>
            <div class="field">
              <label class="field-label">Email <span class="required">*</span></label>
              <input type="email" class="field-input" [value]="dEmail()" (input)="dEmail.set($any($event.target).value)" placeholder="jane@company.com" />
            </div>
            <div class="field">
              <label class="field-label">Role <span class="required">*</span></label>
              <select class="field-select" [value]="dRole()" (change)="dRole.set($any($event.target).value)">
                <option value="RECRUITER">Recruiter</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div class="field">
              <label class="field-label">
                {{ editTarget() ? 'New Password' : 'Password' }}
                @if (!editTarget()) { <span class="required">*</span> }
              </label>
              <input type="password" class="field-input" [value]="dPassword()" (input)="dPassword.set($any($event.target).value)"
                     [placeholder]="editTarget() ? 'Leave blank to keep current password' : 'Set initial password'"
                     autocomplete="new-password" />
            </div>
            @if (dError()) {
              <p class="form-error">{{ dError() }}</p>
            }
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" (click)="closeDialog()" [disabled]="dSaving()">Cancel</button>
            <button class="btn btn-primary" (click)="save()" [disabled]="dSaving()">
              @if (dSaving()) { Saving… } @else { {{ editTarget() ? 'Save Changes' : 'Add Staff' }} }
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .page { display: flex; flex-direction: column; min-height: 100vh; }

    .page-header {
      height: var(--topbar-height);
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 24px; border-bottom: 1px solid var(--border);
      background: var(--bg-card); flex-shrink: 0;
    }

    .page-title { font-size: 15px; font-weight: 600; color: var(--text-1); letter-spacing: -0.01em; }
    .page-sub { font-size: 12px; color: var(--text-3); }

    .btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 7px 14px; border-radius: var(--radius-sm);
      font-size: 13px; font-weight: 500; cursor: pointer;
      border: 1px solid transparent; transition: all 120ms; white-space: nowrap;
    }
    .btn-primary { background: var(--accent); color: #fff; }
    .btn-primary:hover:not(:disabled) { background: var(--accent-hover); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-ghost { background: transparent; color: var(--text-2); border-color: var(--border); }
    .btn-ghost:hover:not(:disabled) { background: var(--bg-hover); color: var(--text-1); }
    .btn-ghost:disabled { opacity: 0.5; cursor: not-allowed; }

    .content { padding: 24px; overflow-y: auto; flex: 1; }

    .filter-row { display: flex; gap: 12px; align-items: center; margin-bottom: 18px; }

    .search-wrap { position: relative; display: flex; align-items: center; }
    .search-icon { position: absolute; left: 10px; color: var(--text-3); pointer-events: none; }
    .search-input {
      padding: 7px 10px 7px 32px;
      background: var(--bg-elevated); border: 1px solid var(--border);
      border-radius: var(--radius-sm); color: var(--text-1);
      font-size: 13px; outline: none; width: 260px; transition: border-color 150ms;
    }
    .search-input:focus { border-color: var(--accent); }
    .search-input::placeholder { color: var(--text-3); }

    .staff-table {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); overflow: hidden;
    }

    .table-header {
      display: grid; grid-template-columns: 2fr 2fr 120px 120px 48px;
      gap: 12px; padding: 10px 16px;
      background: var(--bg-elevated); border-bottom: 1px solid var(--border);
      font-size: 11.5px; font-weight: 600; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.04em;
    }

    .table-row {
      display: grid; grid-template-columns: 2fr 2fr 120px 120px 48px;
      gap: 12px; padding: 12px 16px; align-items: center;
      border-bottom: 1px solid var(--border); transition: background 120ms;
    }
    .table-row:last-child { border-bottom: none; }
    .table-row:hover { background: var(--bg-hover); }

    .member-cell { display: flex; align-items: center; gap: 10px; }

    .avatar {
      width: 32px; height: 32px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 700; color: #fff; flex-shrink: 0;
    }

    .member-name { font-size: 13px; font-weight: 600; color: var(--text-1); }

    .email-cell { font-size: 12.5px; color: var(--text-2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    .role-cell { display: flex; }

    .role-badge {
      display: inline-flex; padding: 2px 9px; border-radius: 999px;
      font-size: 11.5px; font-weight: 500;
    }
    .role-admin { background: var(--accent-subtle); color: var(--accent); }
    .role-recruiter { background: rgba(148,163,184,.12); color: var(--text-2); }

    .date-cell { font-size: 12px; color: var(--text-3); }

    .actions-cell { display: flex; justify-content: flex-end; }

    .action-btn {
      background: none; border: none; cursor: pointer; padding: 5px;
      border-radius: 4px; display: flex; align-items: center; color: var(--text-3);
      transition: color 120ms, background 120ms;
    }
    .action-btn:hover { color: var(--text-1); background: var(--bg-elevated); }

    .empty-state { text-align: center; padding: 60px; color: var(--text-3); font-size: 13px; }

    .overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.6);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000; padding: 24px;
    }

    .modal {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); width: 100%; max-width: 460px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }

    .modal-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 20px; border-bottom: 1px solid var(--border);
    }
    .modal-title { font-size: 14px; font-weight: 600; color: var(--text-1); }
    .modal-close {
      background: none; border: none; cursor: pointer; padding: 4px;
      border-radius: 4px; color: var(--text-3); display: flex; align-items: center;
      transition: color 120ms, background 120ms;
    }
    .modal-close:hover { color: var(--text-1); background: var(--bg-hover); }

    .modal-body { padding: 20px; display: flex; flex-direction: column; gap: 14px; }

    .modal-footer {
      display: flex; gap: 8px; justify-content: flex-end;
      padding: 14px 20px; border-top: 1px solid var(--border);
    }

    .field { display: flex; flex-direction: column; gap: 6px; }
    .field-label { font-size: 13px; font-weight: 500; color: var(--text-2); }
    .required { color: var(--danger); }

    .field-input, .field-select {
      padding: 8px 12px;
      background: var(--bg-elevated); border: 1px solid var(--border);
      border-radius: var(--radius-sm); color: var(--text-1);
      font-size: 13.5px; outline: none; transition: border-color 150ms;
      font-family: var(--font);
    }
    .field-input:focus, .field-select:focus { border-color: var(--accent); }
    .field-input::placeholder { color: var(--text-3); }
    .field-select { cursor: pointer; }

    .form-error { font-size: 13px; color: var(--danger); margin: 0; }
  `],
})
export class StaffComponent implements OnInit {
  private readonly staffSvc = inject(StaffService);

  readonly staff = signal<StaffMember[]>([]);
  readonly search = signal('');
  readonly showDialog = signal(false);
  readonly editTarget = signal<StaffMember | null>(null);

  readonly dFirst = signal('');
  readonly dLast = signal('');
  readonly dEmail = signal('');
  readonly dPassword = signal('');
  readonly dRole = signal<StaffRole>('RECRUITER');
  readonly dSaving = signal(false);
  readonly dError = signal('');

  readonly filtered = computed(() => {
    const s = this.search().toLowerCase();
    return this.staff().filter(m =>
      !s ||
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(s) ||
      m.email.toLowerCase().includes(s)
    );
  });

  ngOnInit() {
    this.staffSvc.listStaff().subscribe({ next: list => this.staff.set(list) });
  }

  openCreate() {
    this.editTarget.set(null);
    this.dFirst.set('');
    this.dLast.set('');
    this.dEmail.set('');
    this.dPassword.set('');
    this.dRole.set('RECRUITER');
    this.dError.set('');
    this.showDialog.set(true);
  }

  openEdit(m: StaffMember) {
    this.editTarget.set(m);
    this.dFirst.set(m.firstName);
    this.dLast.set(m.lastName);
    this.dEmail.set(m.email);
    this.dPassword.set('');
    this.dRole.set(m.role);
    this.dError.set('');
    this.showDialog.set(true);
  }

  closeDialog() {
    this.showDialog.set(false);
    this.dError.set('');
  }

  save() {
    this.dError.set('');

    if (!this.dFirst().trim() || !this.dLast().trim() || !this.dEmail().trim()) {
      this.dError.set('First name, last name, and email are required.');
      return;
    }
    const target = this.editTarget();
    if (!target && !this.dPassword().trim()) {
      this.dError.set('Password is required when creating a new staff member.');
      return;
    }

    this.dSaving.set(true);
    const req: StaffRequest = {
      firstName: this.dFirst().trim(),
      lastName: this.dLast().trim(),
      email: this.dEmail().trim(),
      password: this.dPassword(),
      role: this.dRole(),
    };

    const call$ = target
      ? this.staffSvc.updateStaff(target.id, req)
      : this.staffSvc.createStaff(req);

    call$.subscribe({
      next: saved => {
        if (target) {
          this.staff.update(list => list.map(m => m.id === saved.id ? saved : m));
        } else {
          this.staff.update(list => [...list, saved]);
        }
        this.dSaving.set(false);
        this.showDialog.set(false);
      },
      error: err => {
        this.dSaving.set(false);
        if (err.status === 409) {
          this.dError.set('This email is already in use.');
        } else {
          this.dError.set('Failed to save. Please try again.');
        }
      },
    });
  }

  initials(firstName: string, lastName: string): string {
    return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
  }

  avatarColor(name: string): string {
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#14b8a6'];
    return colors[(name.charCodeAt(0) ?? 0) % colors.length];
  }
}
