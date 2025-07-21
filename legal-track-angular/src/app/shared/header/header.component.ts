import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
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
    RouterModule,
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
                [matTooltip]="'הצג/הסתר תפריט'">
          <mat-icon>menu</mat-icon>
        </button>
        
        <div class="page-title">
          <h1>{{ currentPageTitle }}</h1>
          @if (currentPageSubtitle) {
            <p>{{ currentPageSubtitle }}</p>
          }
        </div>
      </div>

      <!-- Center Section - Search (Future Feature) -->
      <div class="header-center">
        <!-- Future: Global search functionality -->
      </div>

      <!-- Right Section - User Actions -->
      <div class="header-right">
        
        <!-- Quick Actions -->
        <div class="quick-actions">
          <button mat-icon-button 
                  class="action-btn"
                  [matTooltip]="'הוסף לקוח חדש'"
                  routerLink="/clients">
            <mat-icon>person_add</mat-icon>
          </button>

          <button mat-icon-button 
                  class="action-btn"
                  [matTooltip]="'צור תיקייה חדשה'"
                  routerLink="/folders">
            <mat-icon>create_new_folder</mat-icon>
          </button>
        </div>

        <!-- Notifications -->
        <button mat-icon-button 
                class="notification-btn"
                [matTooltip]="'התראות'"
                [matBadge]="notificationCount"
                [matBadgeHidden]="notificationCount === 0"
                matBadgeColor="warn"
                matBadgeSize="small">
          <mat-icon>notifications</mat-icon>
        </button>

        <!-- User Menu -->
        <div class="user-menu">
          @if (currentUser) {
            <button mat-button 
                    class="user-button"
                    [matMenuTriggerFor]="userMenu">
              <div class="user-avatar">
                <div class="avatar-circle">
                  {{ getInitials(currentUser.userName) }}
                </div>
              </div>
              <div class="user-info">
                <span class="user-name">{{ currentUser.userName }}</span>
                <span class="user-role">{{ currentUser.isAdmin ? 'מנהל' : 'עורך דין' }}</span>
              </div>
              <mat-icon class="dropdown-icon">keyboard_arrow_down</mat-icon>
            </button>
          }

          <!-- User Menu Dropdown -->
          <mat-menu #userMenu="matMenu" class="user-dropdown" xPosition="before">
            <div class="user-menu-header">
              <div class="user-avatar-large">
                <div class="avatar-circle-large">
                  {{ getInitials(currentUser?.userName || '') }}
                </div>
              </div>
              <div class="user-details">
                <p class="user-name">{{ currentUser?.userName }}</p>
                <p class="user-email">{{ currentUser?.email }}</p>
                <p class="user-role">{{ currentUser?.isAdmin ? 'מנהל מערכת' : 'עורך דין' }}</p>
              </div>
            </div>

            <mat-divider></mat-divider>

            <button mat-menu-item routerLink="/profile">
              <mat-icon>person</mat-icon>
              <span>פרופיל אישי</span>
            </button>

            <button mat-menu-item routerLink="/settings">
              <mat-icon>settings</mat-icon>
              <span>הגדרות</span>
            </button>

            <button mat-menu-item routerLink="/help">
              <mat-icon>help</mat-icon>
              <span>עזרה ותמיכה</span>
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
      background: linear-gradient(90deg, #ffffff 0%, #fafafa 100%);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      position: relative;
      z-index: 100;
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 20px;
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
      color: #333;
      transition: all 0.3s ease;
      border-radius: 8px;
    }

    .menu-toggle:hover {
      background-color: rgba(63, 81, 181, 0.1);
      color: #3f51b5;
    }

    .page-title h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 600;
      color: #1a237e;
      line-height: 1.2;
      background: linear-gradient(45deg, #1a237e, #3949ab);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
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
      margin-left: 12px;
    }

    .action-btn {
      color: #666;
      transition: all 0.3s ease;
      border-radius: 8px;
    }

    .action-btn:hover {
      background-color: rgba(63, 81, 181, 0.1);
      color: #3f51b5;
    }

    .notification-btn {
      color: #666;
      transition: all 0.3s ease;
      border-radius: 8px;
    }

    .notification-btn:hover {
      background-color: rgba(255, 193, 7, 0.1);
      color: #ff9800;
    }

    .user-button {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 16px;
      border-radius: 12px;
      transition: all 0.3s ease;
      min-width: auto;
      border: 1px solid transparent;
    }

    .user-button:hover {
      background-color: rgba(63, 81, 181, 0.05);
      border-color: rgba(63, 81, 181, 0.2);
    }

    .user-avatar {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .avatar-circle {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(45deg, #3f51b5, #7986cb);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;
      text-transform: uppercase;
      box-shadow: 0 2px 8px rgba(63, 81, 181, 0.3);
    }

    .avatar-circle-large {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(45deg, #3f51b5, #7986cb);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 20px;
      text-transform: uppercase;
      box-shadow: 0 4px 12px rgba(63, 81, 181, 0.3);
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
      color: #333;
      line-height: 1.2;
    }

    .user-role {
      font-size: 12px;
      color: #666;
      line-height: 1;
      font-weight: 400;
    }

    .dropdown-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #666;
      transition: transform 0.3s ease;
    }

    .user-button[aria-expanded="true"] .dropdown-icon {
      transform: rotate(180deg);
    }

    /* User Menu Dropdown Styles */
    .user-dropdown {
      min-width: 300px;
      margin-top: 8px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    }

    .user-menu-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 12px 12px 0 0;
    }

    .user-details {
      flex: 1;
    }

    .user-details .user-name {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin: 0 0 4px 0;
    }

    .user-details .user-email {
      font-size: 14px;
      color: #666;
      margin: 0 0 4px 0;
      font-weight: 400;
    }

    .user-details .user-role {
      font-size: 12px;
      color: #999;
      margin: 0;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .logout-item {
      color: #f44336;
      transition: all 0.3s ease;
    }

    .logout-item:hover {
      background-color: rgba(244, 67, 54, 0.05);
    }

    .logout-item mat-icon {
      color: #f44336;
    }

    /* Improved animations */
    .user-button,
    .action-btn,
    .notification-btn,
    .menu-toggle {
      position: relative;
      overflow: hidden;
    }

    .user-button::before,
    .action-btn::before,
    .notification-btn::before,
    .menu-toggle::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(63, 81, 181, 0.1);
      transform: translate(-50%, -50%);
      transition: width 0.3s ease, height 0.3s ease;
      z-index: -1;
    }

    .user-button:hover::before,
    .action-btn:hover::before,
    .notification-btn:hover::before,
    .menu-toggle:hover::before {
      width: 100%;
      height: 100%;
    }

    /* Badge improvements */
    .mat-badge-content {
      font-weight: 600;
      font-size: 11px;
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .app-header {
        padding: 0 16px;
      }

      .header-left {
        gap: 12px;
      }

      .user-info {
        display: none;
      }

      .user-button {
        padding: 8px;
      }

      .page-title h1 {
        font-size: 18px;
      }

      .page-title p {
        display: none;
      }

      .quick-actions {
        display: none;
      }

      .header-center {
        display: none;
      }
    }

    @media (max-width: 480px) {
      .header-left {
        gap: 8px;
      }

      .header-right {
        gap: 8px;
      }

      .page-title h1 {
        font-size: 16px;
      }

      .user-dropdown {
        min-width: 250px;
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
    '/documents': { 
      title: 'ניהול מסמכים', 
      subtitle: 'העלאה וניהול מסמכים' 
    },
    '/reports': { 
      title: 'דוחות', 
      subtitle: 'דוחות וסיכומים' 
    },
    '/analytics': { 
      title: 'אנליטיקה', 
      subtitle: 'נתונים וסטטיסטיקות' 
    },
    '/settings': { 
      title: 'הגדרות מערכת', 
      subtitle: 'תצורת המערכת והרשאות' 
    },
    '/profile': { 
      title: 'פרופיל אישי', 
      subtitle: 'ניהול פרטים אישיים' 
    },
    '/help': { 
      title: 'עזרה ותמיכה', 
      subtitle: 'מידע ותמיכה טכנית' 
    }
  };

  constructor(private router: Router) {
    // Subscribe to route changes to update page title
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map((event: NavigationEnd) => event.url)
      )
      .subscribe(url => {
        this.updatePageTitle(url);
      });

    // Set initial page title
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

  getInitials(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  onToggleSidenav(): void {
    this.toggleSidenav.emit();
  }

  onLogout(): void {
    this.logout.emit();
  }
}