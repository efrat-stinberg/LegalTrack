import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatTableDataSource } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InviteUserDialogComponent } from './invite-user-dialog/invite-user-dialog.component';
import { UsersService, User } from '../services/users.service';
import { MatDivider } from "@angular/material/divider";

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
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule,
    MatDivider
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
          <button mat-stroked-button>
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
                  <div class="stat-badge active">
                    <mat-icon>trending_up</mat-icon>
                    <span>+12%</span>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card admins">
            <mat-card-content>
              <div class="stat-content">
                <div class="stat-icon admin">
                  <mat-icon>admin_panel_settings</mat-icon>
                </div>
                <div class="stat-info">
                  <h3>{{ adminUsers }}</h3>
                  <p>מנהלים</p>
                  <div class="stat-badge stable">
                    <mat-icon>horizontal_rule</mat-icon>
                    <span>יציב</span>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card lawyers">
            <mat-card-content>
              <div class="stat-content">
                <div class="stat-icon lawyer">
                  <mat-icon>gavel</mat-icon>
                </div>
                <div class="stat-info">
                  <h3>{{ regularUsers }}</h3>
                  <p>עורכי דין</p>
                  <div class="stat-badge active">
                    <mat-icon>trending_up</mat-icon>
                    <span>+8%</span>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card active-users">
            <mat-card-content>
              <div class="stat-content">
                <div class="stat-icon active">
                  <mat-icon>people_online</mat-icon>
                </div>
                <div class="stat-info">
                  <h3>{{ activeUsers }}</h3>
                  <p>משתמשים פעילים</p>
                  <div class="stat-badge active">
                    <mat-icon>circle</mat-icon>
                    <span>עכשיו</span>
                  </div>
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
            @if (sampleUsers.length === 0) {
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
                @for (user of sampleUsers; track user.id) {
                  <div class="user-item">
                    <div class="user-avatar">
                      <div class="avatar-circle" [class.admin]="user.isAdmin">
                        {{ getInitials(user.name) }}
                      </div>
                      <div class="status-indicator" [class.online]="user.isOnline" [class.offline]="!user.isOnline"></div>
                    </div>
                    
                    <div class="user-info">
                      <h4 class="user-name">{{ user.name }}</h4>
                      <p class="user-email">{{ user.email }}</p>
                      <div class="user-meta">
                        <mat-chip-listbox>
                          <mat-chip-option [color]="user.isAdmin ? 'primary' : 'accent'" selected>
                            <mat-icon matChipAvatar>{{ user.isAdmin ? 'admin_panel_settings' : 'gavel' }}</mat-icon>
                            {{ user.isAdmin ? 'מנהל' : 'עורך דין' }}
                          </mat-chip-option>
                        </mat-chip-listbox>
                      </div>
                    </div>

                    <div class="user-stats">
                      <div class="stat-item">
                        <span class="stat-label">תיקיות</span>
                        <span class="stat-value">{{ user.folders }}</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">לקוחות</span>
                        <span class="stat-value">{{ user.clients }}</span>
                      </div>
                    </div>

                    <div class="user-actions">
                      <button mat-icon-button [matTooltip]="'פרופיל משתמש'">
                        <mat-icon>person</mat-icon>
                      </button>
                      <button mat-icon-button [matTooltip]="'הגדרות הרשאות'">
                        <mat-icon>settings</mat-icon>
                      </button>
                      <button mat-icon-button [matMenuTriggerFor]="userMenu" [matTooltip]="'פעולות נוספות'">
                        <mat-icon>more_vert</mat-icon>
                      </button>
                      
                      <mat-menu #userMenu="matMenu">
                        <button mat-menu-item>
                          <mat-icon>edit</mat-icon>
                          <span>ערוך פרטים</span>
                        </button>
                        <button mat-menu-item>
                          <mat-icon>security</mat-icon>
                          <span>נהל הרשאות</span>
                        </button>
                        <button mat-menu-item>
                          <mat-icon>block</mat-icon>
                          <span>השבת זמנית</span>
                        </button>
                        <mat-divider></mat-divider>
                        <button mat-menu-item class="danger">
                          <mat-icon>delete</mat-icon>
                          <span>הסר משתמש</span>
                        </button>
                      </mat-menu>
                    </div>
                  </div>
                }
              </div>
            }
          </mat-card-content>
        </mat-card>

        <!-- Activity Timeline -->
        <mat-card class="activity-card">
          <mat-card-header>
            <mat-card-title>פעילות אחרונה</mat-card-title>
            <mat-card-subtitle>עדכונים בניהול המשתמשים</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="activity-timeline">
              @for (activity of userActivities; track activity.id) {
                <div class="activity-item">
                  <div class="activity-icon" [class]="activity.type">
                    <mat-icon>{{ activity.icon }}</mat-icon>
                  </div>
                  <div class="activity-content">
                    <p class="activity-message">{{ activity.message }}</p>
                    <span class="activity-time">{{ activity.time }}</span>
                  </div>
                </div>
              }
            </div>
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
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      min-height: calc(100vh - 64px);
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      padding: 24px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    .header-content h1 {
      font-size: 32px;
      font-weight: 600;
      color: #1a237e;
      margin: 0 0 8px 0;
      background: linear-gradient(45deg, #1a237e, #3949ab);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .header-content p {
      color: #666;
      font-size: 16px;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .header-actions button {
      border-radius: 12px;
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
      border-radius: 16px;
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
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      transition: transform 0.3s ease;
      border: 1px solid rgba(0, 0, 0, 0.05);
    }

    .stat-card:hover {
      transform: translateY(-4px);
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      background: linear-gradient(45deg, #3f51b5, #7986cb);
    }

    .stat-icon.admin {
      background: linear-gradient(45deg, #9c27b0, #ba68c8);
    }

    .stat-icon.lawyer {
      background: linear-gradient(45deg, #4caf50, #81c784);
    }

    .stat-icon.active {
      background: linear-gradient(45deg, #ff9800, #ffb74d);
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
      border-radius: 12px;
      width: fit-content;
    }

    .stat-badge.active {
      color: #4caf50;
      background: rgba(76, 175, 80, 0.1);
    }

    .stat-badge.stable {
      color: #ff9800;
      background: rgba(255, 152, 0, 0.1);
    }

    .users-card,
    .activity-card {
      margin-bottom: 24px;
      border-radius: 16px;
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
      color: #e0e0e0;
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
      border-radius: 12px;
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
      border-radius: 12px;
      transition: all 0.3s ease;
      background: #fafafa;
    }

    .user-item:hover {
      background: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    .user-avatar {
      position: relative;
    }

    .avatar-circle {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(45deg, #3f51b5, #7986cb);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 18px;
      text-transform: uppercase;
    }

    .avatar-circle.admin {
      background: linear-gradient(45deg, #9c27b0, #ba68c8);
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
      background: #4caf50;
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

    .danger {
      color: #f44336;
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
      background: linear-gradient(45deg, #4caf50, #81c784);
    }

    .activity-icon.login {
      background: linear-gradient(45deg, #2196f3, #64b5f6);
    }

    .activity-icon.permission {
      background: linear-gradient(45deg, #ff9800, #ffb74d);
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
  dataSource = new MatTableDataSource<User>();
  
  totalUsers = 12;
  adminUsers = 2;
  regularUsers = 10;
  activeUsers = 8;

  sampleUsers = [
    {
      id: 2,
      name: 'אדוארד כהן',
      email: 'edward.cohen@lawfirm.co.il',
      isAdmin: false,
      isOnline: true,
      folders: 8,
      clients: 15
    },
    {
      id: 3,
      name: 'רחל לוי',
      email: 'rachel.levi@lawfirm.co.il',
      isAdmin: false,
      isOnline: true,
      folders: 12,
      clients: 22
    },
    {
      id: 4,
      name: 'דוד מזרחי',
      email: 'david.mizrahi@lawfirm.co.il',
      isAdmin: false,
      isOnline: false,
      folders: 5,
      clients: 8
    }
  ];

  userActivities = [
    {
      id: 1,
      type: 'invite',
      message: 'הזמנה נשלחה לעורך דין חדש - שרה אברהם',
      time: 'לפני שעה',
      icon: 'mail'
    },
    {
      id: 2,
      type: 'login',
      message: 'אדוארד כהן התחבר למערכת',
      time: 'לפני 2 שעות',
      icon: 'login'
    },
    {
      id: 3,
      type: 'permission',
      message: 'הרשאות עודכנו עבור רחל לוי',
      time: 'לפני 4 שעות',
      icon: 'security'
    }
  ];

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private usersService: UsersService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    
    setTimeout(() => {
      this.loading = false;
    }, 1000);
    
    // Simulate API call
    // this.usersService.getAllUsers().subscribe({
    //   next: (users) => {
    //     this.dataSource.data = users;
    //     this.updateStatistics(users);
    //     this.loading = false;
    //   },
    //   error: (error) => {
    //     console.error('Error loading users:', error);
    //     this.loading = false;
    //   }
    // });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  openInviteDialog(): void {
    const dialogRef = this.dialog.open(InviteUserDialogComponent, {
      width: '500px',
      disableClose: true,
      direction: 'rtl',
      panelClass: 'invite-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('הזמנה נשלחה בהצלחה!', 'סגור', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.loadUsers();
      }
    });
  }
}