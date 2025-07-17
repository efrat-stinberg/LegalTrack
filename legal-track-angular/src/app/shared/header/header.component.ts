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

      <!-- Right Section - User Actions -->
      <div class="header-right">
        
        <!-- Notifications -->
        <button mat-icon-button 
                class="notification-btn"
                [matTooltip]="'התראות'"
                [matBadge]="notificationCount"
                [matBadgeHidden]="notificationCount === 0"
                matBadgeColor="warn">
          <mat-icon>notifications</mat-icon>
        </button>

        <!-- User Menu -->
        <div class="user-menu">
          @if (currentUser) {
            <button mat-button 
                    class="user-button"
                    [matMenuTriggerFor]="userMenu">
              <div class="user-avatar">
                <mat-icon>account_circle</mat-icon>
              </div>
              <div class="user-info">
                <span class="user-name">{{ currentUser.userName }}</span>
                <span class="user-role">{{ currentUser.isAdmin ? 'מנהל' : 'עורך דין' }}</span>
              </div>
              <mat-icon class="dropdown-icon">keyboard_arrow_down</mat-icon>
            </button>
          }

          <!-- User Menu Dropdown -->
          <mat-menu #userMenu="matMenu" class="user-dropdown">
            <div class="user-menu-header">
              <div class="user-avatar-large">
                <mat-icon>account_circle</mat-icon>
              </div>
              <div class="user-details">
                <p class="user-name">{{ currentUser?.userName }}</p>
                <p class="user-email">{{ currentUser?.email }}</p>
                <p class="user-role">{{ currentUser?.isAdmin ? 'מנהל מערכת' : 'עורך דין' }}</p>
              </div>
            </div>

            <mat-divider></mat-divider>

            <button mat-menu-item disabled>
              <mat-icon>person</mat-icon>
              <span>פרופיל אישי</span>
              <span class="coming-soon">בקרוב</span>
            </button>

            <button mat-menu-item disabled>
              <mat-icon>settings</mat-icon>
              <span>הגדרות</span>
              <span class="coming-soon">בקרוב</span>
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
      background: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      position: relative;
      z-index: 100;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .menu-toggle {
      color: #333;
    }

    .page-title h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
      color: #333;
      line-height: 1.2;
    }

    .page-title p {
      margin: 0;
      font-size: 12px;
      color: #666;
      line-height: 1;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .notification-btn {
      color: #333;
    }

    .user-button {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 12px;
      border-radius: 8px;
      transition: background-color 0.2s;
      min-width: auto;
    }

    .user-button:hover {
      background-color: #f5f5f5;
    }

    .user-avatar mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #666;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      text-align: right;
    }

    .user-name {
      font-size: 14px;
      font-weight: 500;
      color: #333;
      line-height: 1.2;
    }

    .user-role {
      font-size: 12px;
      color: #666;
      line-height: 1;
    }

    .dropdown-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #666;
      transition: transform 0.2s;
    }

    .user-button[aria-expanded="true"] .dropdown-icon {
      transform: rotate(180deg);
    }

    /* User Menu Dropdown Styles */
    .user-dropdown {
      min-width: 280px;
      margin-top: 8px;
    }

    .user-menu-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: #f8f9fa;
    }

    .user-avatar-large mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #666;
    }

    .user-details {
      flex: 1;
    }

    .user-details .user-name {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin: 0 0 4px 0;
    }

    .user-details .user-email {
      font-size: 14px;
      color: #666;
      margin: 0 0 4px 0;
    }

    .user-details .user-role {
      font-size: 12px;
      color: #999;
      margin: 0;
    }

    .coming-soon {
      font-size: 10px;
      color: #ff9800;
      background: rgba(255, 152, 0, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
      margin-right: auto;
    }

    .logout-item {
      color: #f44336;
    }

    .logout-item mat-icon {
      color: #f44336;
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .app-header {
        padding: 0 16px;
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
    }
  `]
})
export class HeaderComponent {
  @Input() currentUser: User | null = null;
  @Output() toggleSidenav = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  currentPageTitle = 'דשבורד ניהול';
  currentPageSubtitle = '';
  notificationCount = 0; // This would come from a service

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

  onToggleSidenav(): void {
    this.toggleSidenav.emit();
  }

  onLogout(): void {
    this.logout.emit();
  }
}