import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InviteUserDialogComponent } from './invite-user-dialog/invite-user-dialog.component';
import { ResetLinkDialogComponent } from './reset-link-dialog/reset-link-dialog.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../shared/confirm-dialog/confirm-dialog.component';
import { UsersService, User } from '../services/users.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatTooltipModule,
    MatMenuModule
  ],
  template: `
    <div class="users-container">
      <div class="page-header">
        <div class="header-content">
          <h1>ניהול משתמשים</h1>
          <p>ניהול עורכי דין והרשאות במערכת</p>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="openInviteDialog()">
            <mat-icon>person_add</mat-icon>
            הזמן עורך דין
          </button>
          <button mat-stroked-button (click)="exportCsv()" [disabled]="users.length === 0">
            <mat-icon>download</mat-icon>
            ייצא רשימה
          </button>
        </div>
      </div>

      @if (loading) {
        <div class="loading-container">
          <mat-spinner diameter="48"></mat-spinner>
          <p>טוען משתמשים...</p>
        </div>
      } @else {
        
        <!-- Statistics Cards -->
        <div class="stats-section">
          <mat-card class="stat-card total">
            <mat-card-content>
              <div class="stat-content">
                <div class="stat-icon">
                  <mat-icon>people</mat-icon>
                </div>
                <div class="stat-info">
                  <h3>{{ totalUsers }}</h3>
                  <p>סך המשתמשים</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- <mat-card class="stat-card admins">
            <mat-card-content>
              <div class="stat-content">
                <div class="stat-icon admin">
                  <mat-icon>admin_panel_settings</mat-icon>
                </div>
                <div class="stat-info">
                  <h3>{{ adminUsers }}</h3>
                  <p>מנהלים</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card> -->

          <mat-card class="stat-card lawyers">
            <mat-card-content>
              <div class="stat-content">
                <div class="stat-icon lawyer">
                  <mat-icon>gavel</mat-icon>
                </div>
                <div class="stat-info">
                  <h3>{{ regularUsers }}</h3>
                  <p>עורכי דין</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

        </div>

        <!-- Users Management Card -->
        <mat-card class="users-card">
          <mat-card-header>
            <div class="card-header-content">
              <div class="header-title">
                <mat-card-title>רשימת משתמשים</mat-card-title>
                <mat-card-subtitle>ניהול עורכי דין והרשאות</mat-card-subtitle>
              </div>
              <div class="header-filters">
                <mat-form-field appearance="outline" class="search-field">
                  <mat-label>חיפוש משתמשים</mat-label>
                  <input matInput (keyup)="applyFilter($event)" placeholder="חפש לפי שם או אימייל">
                  <mat-icon matSuffix>search</mat-icon>
                </mat-form-field>
              </div>
            </div>
          </mat-card-header>
          
          <mat-card-content>
            @if (otherUsersCount === 0) {
              <div class="no-data">
                <div class="no-data-icon">
                  <mat-icon>people_outline</mat-icon>
                </div>
                <h3>אין משתמשים נוספים</h3>
                <p>רק המנהל הראשי רשום כרגע במערכת</p>
                <p>השתמש בכפתור "הזמן עורך דין" להוספת משתמשים חדשים</p>
                <button mat-raised-button color="primary" (click)="openInviteDialog()" class="cta-button">
                  <mat-icon>person_add</mat-icon>
                  הזמן עורך דין ראשון
                </button>
              </div>
            } @else {
              <!-- User List -->
              <div class="users-list">
                @for (user of filteredUsers; track user.userId) {
                  <div class="user-item">
                    <div class="user-avatar">
                      <div class="avatar-circle" [class.admin]="user.isAdmin">
                        {{ getInitials(user.username) }}
                      </div>
                    </div>
                    
                    <div class="user-info">
                      <h4 class="user-name">{{ user.username }}</h4>
                      <p class="user-email">{{ user.email }}</p>
                      <div class="user-meta">
                        <span class="role-badge">
                          <mat-icon aria-hidden="true">{{ user.isAdmin ? 'admin_panel_settings' : 'gavel' }}</mat-icon>
                          {{ user.isAdmin ? 'מנהל' : 'עורך דין' }}
                        </span>
                      </div>
                    </div>

                    <div class="user-actions">
                      <button mat-icon-button [matTooltip]="'קישור לאיפוס סיסמה'" [attr.aria-label]="'קישור לאיפוס סיסמה עבור ' + user.username" (click)="openResetLink(user)">
                        <mat-icon>lock_reset</mat-icon>
                      </button>
                      @if (!user.isAdmin) {
                        <button mat-icon-button [matTooltip]="'הסר משתמש'" [attr.aria-label]="'הסרת ' + user.username" (click)="removeUser(user)">
                          <mat-icon>delete</mat-icon>
                        </button>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </mat-card-content>
        </mat-card>

      }
    </div>
  `,
  styles: [`
    .users-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
      background: #F6F7F9;
      min-height: calc(100vh - 64px);
    }

    .page-header {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 24px;
    }

    .header-content h1 {
      font-family: var(--font-display);
      font-size: 30px;
      font-weight: 600;
      color: var(--navy-900);
      margin: 0 0 4px 0;
    }

    .header-content p {
      color: var(--slate);
      font-size: 14px;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .header-actions button {
      border-radius: 8px;
      padding: 12px 24px;
      font-weight: 500;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    .loading-container p {
      margin-top: 20px;
      color: #666;
      font-size: 16px;
    }

    .stats-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .stat-card {
      border-radius: 8px;
      box-shadow: none;
      border: 1px solid var(--border);
    }

    .stat-card:hover {
      transform: translateY(0);
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      width: 40px;
      height: 40px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--navy-700);
      background: var(--ground);
      border: 1px solid var(--border);
    }

    .stat-icon.active {
      background: #4A5363;
    }

    .stat-info {
      flex: 1;
    }

    .stat-info h3 {
      font-size: 32px;
      font-weight: 700;
      margin: 0 0 4px 0;
      color: #333;
    }

    .stat-info p {
      margin: 0 0 8px 0;
      color: #666;
      font-size: 14px;
    }

    .stat-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 8px;
      width: fit-content;
    }

    .stat-badge.active {
      color: #1B3355;
      background: rgba(76, 175, 80, 0.1);
    }

    .stat-badge.stable {
      color: #4A5363;
      background: rgba(255, 152, 0, 0.1);
    }

    .users-card,
    .activity-card {
      margin-bottom: 24px;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    .card-header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .search-field {
      width: 300px;
    }

    .no-data {
      text-align: center;
      padding: 60px;
      color: #666;
    }

    .no-data-icon mat-icon {
      font-size: 72px;
      width: 72px;
      height: 72px;
      color: #E3E6EB;
      margin-bottom: 24px;
    }

    .no-data h3 {
      font-size: 24px;
      font-weight: 600;
      color: #333;
      margin-bottom: 12px;
    }

    .no-data p {
      margin-bottom: 8px;
      line-height: 1.5;
    }

    .cta-button {
      margin-top: 24px;
      padding: 12px 32px;
      border-radius: 8px;
    }

    .users-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .user-item {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 20px;
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-radius: 8px;
      transition: all 0.3s ease;
      background: #F6F7F9;
    }

    .user-item:hover {
      background: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(0);
    }

    .user-avatar {
      position: relative;
    }

    .avatar-circle {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #1B3355;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 18px;
      text-transform: uppercase;
    }

    .avatar-circle.admin {
      background: #2A4870;
    }

    .status-indicator {
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid white;
    }

    .status-indicator.online {
      background: #1B3355;
    }

    .status-indicator.offline {
      background: #9e9e9e;
    }

    .user-info {
      flex: 1;
    }

    .user-name {
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 4px 0;
      color: #333;
    }

    .user-email {
      font-size: 14px;
      color: #666;
      margin: 0 0 12px 0;
    }

    .user-stats {
      display: flex;
      gap: 24px;
    }

    .stat-item {
      text-align: center;
    }

    .stat-label {
      display: block;
      font-size: 12px;
      color: #999;
      margin-bottom: 4px;
    }

    .stat-value {
      display: block;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .user-actions {
      display: flex;
      gap: 4px;
    }

    .role-badge {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 2px 8px; border-radius: 4px;
      border: 1px solid var(--border-strong); background: #FFFFFF;
      color: var(--navy-700); font-size: 12px; font-weight: 600; line-height: 1.6;
    }
    .role-badge mat-icon { font-size: 15px; width: 15px; height: 15px; }
    .user-actions .mat-mdc-icon-button { color: var(--slate); }

    .danger {
      color: #1A1F2B;
    }

    .activity-timeline {
      max-height: 400px;
      overflow-y: auto;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 0;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }

    .activity-item:last-child {
      border-bottom: none;
    }

    .activity-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .activity-icon.invite {
      background: #1B3355;
    }

    .activity-icon.login {
      background: #1F4E8C;
    }

    .activity-icon.permission {
      background: #4A5363;
    }

    .activity-message {
      margin: 0 0 4px 0;
      font-size: 14px;
      color: #333;
    }

    .activity-time {
      font-size: 12px;
      color: #999;
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .users-container {
        padding: 16px;
      }

      .page-header {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
      }

      .header-actions {
        width: 100%;
        justify-content: stretch;
      }

      .header-actions button {
        flex: 1;
      }

      .card-header-content {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
      }

      .search-field {
        width: 100%;
      }

      .stats-section {
        grid-template-columns: 1fr;
      }

      .user-item {
        flex-direction: column;
        text-align: center;
        gap: 12px;
      }

      .user-stats {
        justify-content: center;
      }
    }
  `]
})
export class UsersComponent implements OnInit {
  loading = false;
  users: User[] = [];
  filteredUsers: User[] = [];
  private filterValue = '';

  totalUsers = 0;
  adminUsers = 0;
  regularUsers = 0;
  otherUsersCount = 0;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private usersService: UsersService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  // Users of the admin's office, from GET /api/users
  loadUsers(): void {
    this.loading = true;
    this.usersService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.totalUsers = users.length;
        this.adminUsers = users.filter(u => u.isAdmin).length;
        this.regularUsers = this.totalUsers - this.adminUsers;
        this.otherUsersCount = this.regularUsers;
        this.applyCurrentFilter();
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open(error.message || 'שגיאה בטעינת המשתמשים', 'סגור', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  applyFilter(event: Event): void {
    this.filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.applyCurrentFilter();
  }

  private applyCurrentFilter(): void {
    this.filteredUsers = this.users.filter(u =>
      !this.filterValue ||
      (u.username || '').toLowerCase().includes(this.filterValue) ||
      (u.email || '').toLowerCase().includes(this.filterValue));
  }

  getInitials(name: string): string {
    return (name || '?')
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  openResetLink(user: User): void {
    this.dialog.open(ResetLinkDialogComponent, {
      data: user,
      width: '500px',
      maxWidth: 'calc(100vw - 32px)',
      direction: 'rtl'
    });
  }

  removeUser(user: User): void {
    const data: ConfirmDialogData = {
      title: 'הסרת משתמש',
      message: `להסיר את ${user.username} (${user.email}) מהמשרד? הוא ינותק מיד ולא יוכל להתחבר. התיקים והלקוחות של המשרד נשארים.`,
      confirmText: 'הסרה',
      icon: 'person_remove'
    };
    this.dialog.open(ConfirmDialogComponent, { data, width: '440px', maxWidth: 'calc(100vw - 32px)', direction: 'rtl' })
      .afterClosed()
      .subscribe((confirmed: boolean) => {
        if (confirmed) this.deleteUser(user);
      });
  }

  private deleteUser(user: User): void {
    this.usersService.deleteUser(user.userId).subscribe({
      next: () => {
        this.snackBar.open('המשתמש הוסר', 'סגור', { duration: 3000, panelClass: ['success-snackbar'] });
        this.loadUsers();
      },
      error: (error) => {
        this.snackBar.open(error.message || 'שגיאה בהסרת המשתמש', 'סגור', { duration: 5000, panelClass: ['error-snackbar'] });
      }
    });
  }

  // Downloads the office's users as a CSV file (opens in Excel; BOM keeps Hebrew readable)
  exportCsv(): void {
    const escape = (value: string) => `"${(value ?? '').replace(/"/g, '""')}"`;
    const rows = [
      ['שם', 'אימייל', 'תפקיד'],
      ...this.users.map(u => [u.username, u.email, u.isAdmin ? 'מנהל' : 'עורך דין'])
    ];
    const csv = '﻿' + rows.map(r => r.map(escape).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'users.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  openInviteDialog(): void {
    const dialogRef = this.dialog.open(InviteUserDialogComponent, {
      width: '500px',
      maxWidth: 'calc(100vw - 32px)',
      disableClose: true,
      direction: 'rtl',
      panelClass: 'invite-dialog'
    });

    // The dialog shows its own success/failure message; just refresh the list
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
      }
    });
  }
}
