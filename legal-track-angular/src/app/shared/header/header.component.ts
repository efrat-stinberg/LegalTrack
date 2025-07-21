import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { filter, map } from 'rxjs/operators';
import { User } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
    MatBadgeModule
  ],
  template: `
    <header class="app-header">
      
      <!-- Left Section - Menu Toggle & Page Title -->
      <div class="header-left">
        <button mat-icon-button 
                class="menu-toggle"
                (click)="onToggleSidenav()"
                [matTooltip]="'תפריט ניווט'"
                matTooltipPosition="below">
          <mat-icon>menu</mat-icon>
        </button>
        
        <div class="page-title">
          <h1>{{ currentPageTitle }}</h1>
          @if (currentPageSubtitle) {
            <p>{{ currentPageSubtitle }}</p>
          }
        </div>
      </div>

      <!-- Center Section - Search (Future) -->
      <div class="header-center">
        <!-- Reserved for global search -->
      </div>

      <!-- Right Section - User Actions -->
      <div class="header-right">
        
        <!-- Quick Actions -->
        <div class="quick-actions">
          <button mat-icon-button 
                  class="action-btn"
                  [matTooltip]="'התראות'"
                  matTooltipPosition="below"
                  [matBadge]="notificationCount"
                  [matBadgeHidden]="notificationCount === 0"
                  matBadgeColor="warn"
                  matBadgeSize="small">
            <mat-icon>notifications_none</mat-icon>
          </button>

          <button mat-icon-button 
                  class="action-btn"
                  [matTooltip]="'הגדרות מהירות'"
                  matTooltipPosition="below">
            <mat-icon>settings</mat-icon>
          </button>
        </div>

        <!-- User Menu -->
        <div class="user-menu">
          @if (currentUser) {
            <button mat-button 
                    class="user-button"
                    [matMenuTriggerFor]="userMenu"
                    [matTooltip]="'תפריט משתמש'"
                    matTooltipPosition="below">
              <div class="user-avatar">
                <div class="avatar-circle">
                  <span>{{ getUserInitials() }}</span>
                </div>
              </div>
              <div class="user-info">
                <span class="user-name">{{ currentUser.userName }}</span>
                <span class="user-role">{{ getUserRoleText() }}</span>
              </div>
              <mat-icon class="dropdown-icon">expand_more</mat-icon>
            </button>
          }

          <!-- User Menu Dropdown -->
          <mat-menu #userMenu="matMenu" class="user-dropdown" xPosition="before">
            <div class="user-menu-header">
              <div class="user-avatar-large">
                <span>{{ getUserInitials() }}</span>
              </div>
              <div class="user-details">
                <h3>{{ currentUser?.userName }}</h3>
                <p class="user-email">{{ currentUser?.email }}</p>
                <span class="role-badge" [class.admin]="currentUser?.isAdmin">
                  {{ getUserRoleText() }}
                </span>
              </div>
            </div>

            <mat-divider></mat-divider>

            <button mat-menu-item class="menu-item" disabled>
              <mat-icon>person_outline</mat-icon>
              <span>פרופיל אישי</span>
              <span class="coming-soon">בקרוב</span>
            </button>

            <button mat-menu-item class="menu-item" disabled>
              <mat-icon>palette</mat-icon>
              <span>מראה ונושא</span>
              <span class="coming-soon">בקרוב</span>
            </button>

            <button mat-menu-item class="menu-item" disabled>
              <mat-icon>security</mat-icon>
              <span>אבטחה והרשאות</span>
              <span class="coming-soon">בקרוב</span>
            </button>

            <mat-divider></mat-divider>

            <button mat-menu-item class="menu-item" disabled>
              <mat-icon>help_outline</mat-icon>
              <span>עזרה ותמיכה</span>
            </button>

            <button mat-menu-item class="menu-item" disabled>
              <mat-icon>feedback</mat-icon>
              <span>משוב</span>
            </button>

            <mat-divider></mat-divider>

            <button mat-menu-item (click)="onLogout()" class="logout-item">
              <mat-icon>logout</mat-icon>
              <span>התנתק</span>
            </button>
          </mat-menu>
        </div>
      </div>

    </header>
  `,
  styles: [`
    .app-header {
      height: 64px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      position: relative;
      z-index: 100;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
      flex: 1;
    }

    .header-center {
      flex: 2;
      display: flex;
      justify-content: center;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
      justify-content: flex-end;
    }

    .menu-toggle {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: rgba(33, 150, 243, 0.1);
      color: #2196F3;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .menu-toggle:hover {
      background: rgba(33, 150, 243, 0.15);
      transform: scale(1.05);
    }

    .page-title h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #1a1a1a;
      line-height: 1.2;
      letter-spacing: -0.01em;
    }

    .page-title p {
      margin: 0;
      font-size: 13px;
      color: #666;
      line-height: 1;
      font-weight: 400;
    }

    .quick-actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .action-btn {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      color: #666;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .action-btn:hover {
      background: rgba(0, 0, 0, 0.05);
      color: #333;
      transform: translateY(-1px);
    }

    .user-button {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 6px 12px 6px 8px;
      border-radius: 12px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      min-width: auto;
      height: 48px;
      background: rgba(0, 0, 0, 0.02);
      border: 1px solid rgba(0, 0, 0, 0.08);
    }

    .user-button:hover {
      background: rgba(0, 0, 0, 0.05);
      transform: translateY(-1px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .user-avatar {
      position: relative;
    }

    .avatar-circle {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 14px;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
    }

    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      text-align: right;
    }

    .user-name {
      font-size: 14px;
      font-weight: 600;
      color: #1a1a1a;
      line-height: 1.2;
    }

    .user-role {
      font-size: 12px;
      color: #666;
      line-height: 1;
      font-weight: 500;
    }

    .dropdown-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #999;
      transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .user-button[aria-expanded="true"] .dropdown-icon {
      transform: rotate(180deg);
    }

    /* User Menu Dropdown Styles */
    .user-dropdown {
      min-width: 320px;
      margin-top: 8px;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      border: 1px solid rgba(0, 0, 0, 0.08);
      overflow: hidden;
    }

    .user-menu-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    }

    .user-avatar-large {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 20px;
      box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
    }

    .user-details {
      flex: 1;
    }

    .user-details h3 {
      font-size: 18px;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0 0 4px 0;
      line-height: 1.2;
    }

    .user-email {
      font-size: 14px;
      color: #666;
      margin: 0 0 8px 0;
      line-height: 1.2;
    }

    .role-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: #e3f2fd;
      color: #1976d2;
    }

    .role-badge.admin {
      background: #f3e5f5;
      color: #7b1fa2;
    }

    .menu-item {
      padding: 12px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      transition: all 0.2s ease;
      position: relative;
    }

    .menu-item:not(:disabled):hover {
      background: rgba(33, 150, 243, 0.05);
    }

    .menu-item mat-icon {
      width: 20px;
      height: 20px;
      font-size: 20px;
      color: #666;
    }

    .menu-item span:not(.coming-soon) {
      flex: 1;
      font-size: 14px;
      font-weight: 500;
      color: #333;
    }

    .coming-soon {
      font-size: 10px;
      color: #ff9800;
      background: rgba(255, 152, 0, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .logout-item {
      color: #f44336 !important;
      border-top: 1px solid rgba(0, 0, 0, 0.05);
    }

    .logout-item mat-icon {
      color: #f44336 !important;
    }

    .logout-item:hover {
      background: rgba(244, 67, 54, 0.05) !important;
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
      .app-header {
        padding: 0 20px;
      }
      
      .header-center {
        display: none;
      }
    }

    @media (max-width: 768px) {
      .app-header {
        padding: 0 16px;
      }

      .user-info {
        display: none;
      }

      .user-button {
        padding: 6px 8px;
        gap: 0;
      }

      .page-title h1 {
        font-size: 18px;
      }

      .page-title p {
        display: none;
      }

      .quick-actions {
        gap: 0;
      }

      .user-dropdown {
        min-width: 280px;
      }
    }

    @media (max-width: 480px) {
      .app-header {
        padding: 0 12px;
      }

      .header-left {
        gap: 8px;
      }

      .header-right {
        gap: 4px;
      }

      .page-title h1 {
        font-size: 16px;
      }

      .quick-actions .action-btn:first-child {
        display: none;
      }
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .app-header {
        background: rgba(26, 26, 46, 0.95);
        border-bottom-color: rgba(255, 255, 255, 0.1);
      }

      .page-title h1 {
        color: #e0e0e0;
      }

      .page-title p {
        color: #b0b0b0;
      }

      .user-name {
        color: #e0e0e0;
      }

      .user-role {
        color: #b0b0b0;
      }
    }

    /* Accessibility improvements */
    @media (prefers-reduced-motion: reduce) {
      * {
        transition: none !important;
        animation: none !important;
      }
    }
  `]
})
export class HeaderComponent {
  @Input() currentUser: User | null = null;
  @Output() toggleSidenav = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  currentPageTitle = 'דשבורד ניהול';
  currentPageSubtitle = '';
  notificationCount = 3; // Example notification count

  private pageTitles: { [key: string]: { title: string; subtitle?: string } } = {
    '/dashboard': { 
      title: 'דשבורד ניהול', 
      subtitle: 'סקירה כללית של המערכת' 
    },
    '/users': { 
      title: 'ניהול משתמשים', 
      subtitle: 'ניהול עורכי דין והרשאות' 
    },
    '/clients': { 
      title: 'ניהול לקוחות', 
      subtitle: 'רשימת לקוחות ופרטיהם' 
    },
    '/folders': { 
      title: 'ניהול תיקיות', 
      subtitle: 'תיקיות ומסמכים' 
    },
    '/reports': { 
      title: 'דוחות ואנליטיקה', 
      subtitle: 'נתונים וסטטיסטיקות' 
    },
    '/settings': { 
      title: 'הגדרות מערכת', 
      subtitle: 'תצורת המערכת והרשאות' 
    }
  };

  constructor(private router: Router) {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map((event: NavigationEnd) => event.url)
      )
      .subscribe(url => {
        this.updatePageTitle(url);
      });

    this.updatePageTitle(this.router.url);
  }

  private updatePageTitle(url: string): void {
    const pageInfo = this.pageTitles[url];
    if (pageInfo) {
      this.currentPageTitle = pageInfo.title;
      this.currentPageSubtitle = pageInfo.subtitle || '';
    } else {
      this.currentPageTitle = 'Legal Flow Admin';
      this.currentPageSubtitle = '';
    }
  }

  getUserInitials(): string {
    if (!this.currentUser?.userName) return 'U';
    
    const names = this.currentUser.userName.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return names[0][0].toUpperCase();
  }

  getUserRoleText(): string {
    return this.currentUser?.isAdmin ? 'מנהל מערכת' : 'עורך דין';
  }

  onToggleSidenav(): void {
    this.toggleSidenav.emit();
  }

  onLogout(): void {
    this.logout.emit();
  }
}