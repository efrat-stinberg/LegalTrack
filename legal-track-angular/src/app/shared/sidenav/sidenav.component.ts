import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { User } from '../../services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatTooltipModule
  ],
  template: `
    <nav class="sidenav" [class.open]="isOpen">
      
      <!-- Logo Section -->
      <div class="logo-section">
        <div class="logo">
          <mat-icon class="logo-icon">gavel</mat-icon>
          @if (isOpen) {
            <span class="logo-text">Legal Flow</span>
          }
        </div>
        @if (isOpen) {
          <span class="admin-badge">Admin Panel</span>
        }
      </div>

      <!-- User Info Section -->
      @if (currentUser && isOpen) {
        <div class="user-section">
          <div class="user-avatar">
            <mat-icon>account_circle</mat-icon>
          </div>
          <div class="user-info">
            <p class="user-name">{{ currentUser.userName }}</p>
            <p class="user-role">{{ currentUser.isAdmin ? 'מנהל מערכת' : 'עורך דין' }}</p>
          </div>
        </div>
      }

      <!-- Navigation Menu -->
      <div class="nav-menu">
        <div class="nav-section">
          @if (isOpen) {
            <h3 class="section-title">ניהול כללי</h3>
          }
          
          @for (item of mainNavItems; track item.route) {
            <a [routerLink]="item.route"
               routerLinkActive="active"
               class="nav-item"
               [matTooltip]="!isOpen ? item.label : ''"
               [matTooltipPosition]="'left'">
              <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
              @if (isOpen) {
                <span class="nav-label">{{ item.label }}</span>
              }
              @if (item.badge && isOpen) {
                <span class="nav-badge">{{ item.badge }}</span>
              }
            </a>
          }
        </div>

        @if (contentNavItems.length > 0) {
          <div class="nav-section">
            @if (isOpen) {
              <h3 class="section-title">ניהול תוכן</h3>
            }
            
            @for (item of contentNavItems; track item.route) {
              <a [routerLink]="item.route"
                 routerLinkActive="active"
                 class="nav-item"
                 [matTooltip]="!isOpen ? item.label : ''"
                 [matTooltipPosition]="'left'">
                <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
                @if (isOpen) {
                  <span class="nav-label">{{ item.label }}</span>
                }
              </a>
            }
          </div>
        }

        @if (analyticsNavItems.length > 0) {
          <div class="nav-section">
            @if (isOpen) {
              <h3 class="section-title">דוחות ואנליטיקה</h3>
            }
            
            @for (item of analyticsNavItems; track item.route) {
              <a [routerLink]="item.route"
                 routerLinkActive="active"
                 class="nav-item"
                 [matTooltip]="!isOpen ? item.label : ''"
                 [matTooltipPosition]="'left'">
                <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
                @if (isOpen) {
                  <span class="nav-label">{{ item.label }}</span>
                }
              </a>
            }
          </div>
        }
      </div>

      <!-- Bottom Actions -->
      <div class="nav-bottom">
        <a [routerLink]="'/settings'" 
           routerLinkActive="active"
           class="nav-item" 
           [matTooltip]="!isOpen ? 'הגדרות' : ''"
           [matTooltipPosition]="'left'">
          <mat-icon class="nav-icon">settings</mat-icon>
          @if (isOpen) {
            <span class="nav-label">הגדרות</span>
          }
        </a>

        <a [routerLink]="'/help'"
           routerLinkActive="active" 
           class="nav-item help-button" 
           [matTooltip]="!isOpen ? 'עזרה' : ''"
           [matTooltipPosition]="'left'">
          <mat-icon class="nav-icon">help</mat-icon>
          @if (isOpen) {
            <span class="nav-label">עזרה</span>
          }
        </a>
      </div>

    </nav>

    <!-- Overlay for mobile -->
    @if (isOpen && isMobile) {
      <div class="sidenav-overlay" 
           (click)="closeSidenav()">
      </div>
    }
  `,
  styles: [`
    .sidenav {
      position: fixed;
      top: 0;
      right: 0;
      height: 100vh;
      width: 280px;
      background: linear-gradient(180deg, #1a237e 0%, #283593 50%, #3949ab 100%);
      color: white;
      transform: translateX(100%);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
      border-left: 1px solid rgba(255, 255, 255, 0.12);
    }

    .sidenav.open {
      transform: translateX(0);
    }

    .logo-section {
      padding: 24px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .logo-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #ffd700;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    }

    .logo-text {
      font-size: 24px;
      font-weight: 600;
      letter-spacing: -0.5px;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }

    .admin-badge {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.8);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      background: rgba(255, 255, 255, 0.1);
      padding: 4px 8px;
      border-radius: 12px;
      display: inline-block;
    }

    .user-section {
      padding: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(255, 255, 255, 0.05);
    }

    .user-avatar mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: rgba(255, 255, 255, 0.9);
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      padding: 4px;
    }

    .user-info {
      flex: 1;
    }

    .user-name {
      margin: 0 0 4px 0;
      font-weight: 500;
      font-size: 16px;
      color: rgba(255, 255, 255, 0.95);
    }

    .user-role {
      margin: 0;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.7);
      font-weight: 400;
    }

    .nav-menu {
      flex: 1;
      padding: 20px 0;
      overflow-y: auto;
    }

    .nav-section {
      margin-bottom: 24px;
    }

    .section-title {
      font-size: 11px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.6);
      text-transform: uppercase;
      letter-spacing: 1.2px;
      margin: 0 0 12px 20px;
      padding: 0 0 8px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .nav-item {
      display: flex;
      align-items: center;
      padding: 14px 20px;
      color: rgba(255, 255, 255, 0.85);
      text-decoration: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      gap: 16px;
      cursor: pointer;
      border: none;
      background: none;
      width: 100%;
      text-align: right;
      border-radius: 0 25px 25px 0;
      margin: 2px 0;
    }

    .nav-item:hover {
      background: rgba(255, 255, 255, 0.12);
      color: white;
      transform: translateX(-4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .nav-item.active {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    }

    .nav-item.active::before {
      content: '';
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: linear-gradient(180deg, #ffd700 0%, #ffeb3b 100%);
      box-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
    }

    .nav-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
      flex-shrink: 0;
      transition: all 0.3s ease;
    }

    .nav-item:hover .nav-icon {
      transform: scale(1.1);
    }

    .nav-label {
      flex: 1;
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.25px;
    }

    .nav-badge {
      background: linear-gradient(45deg, #f44336, #e57373);
      color: white;
      font-size: 10px;
      font-weight: 700;
      padding: 3px 7px;
      border-radius: 12px;
      min-width: 20px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(244, 67, 54, 0.3);
    }

    .nav-bottom {
      padding: 20px 0;
      border-top: 1px solid rgba(255, 255, 255, 0.12);
      background: rgba(0, 0, 0, 0.1);
    }

    .help-button {
      width: 100%;
      text-align: right;
    }

    .sidenav-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.6);
      z-index: 999;
      backdrop-filter: blur(4px);
    }

    /* Custom scrollbar for nav menu */
    .nav-menu::-webkit-scrollbar {
      width: 4px;
    }

    .nav-menu::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 2px;
    }

    .nav-menu::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 2px;
      transition: background 0.3s ease;
    }

    .nav-menu::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.5);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .sidenav {
        width: 280px;
        transform: translateX(100%);
      }

      .nav-item:hover {
        transform: none;
      }
    }

    @media (min-width: 769px) {
      .sidenav-overlay {
        display: none;
      }
    }

    /* Animation improvements */
    .nav-item {
      animation: fadeInUp 0.3s ease-out;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Enhanced focus states for accessibility */
    .nav-item:focus {
      outline: 2px solid rgba(255, 215, 0, 0.8);
      outline-offset: -2px;
    }
  `]
})
export class SidenavComponent {
  @Input() isOpen = true;
  @Input() currentUser: User | null = null;
  @Output() toggleSidenav = new EventEmitter<void>();

  isMobile = window.innerWidth <= 768;

  mainNavItems: NavItem[] = [
    {
      label: 'דשבורד',
      icon: 'dashboard',
      route: '/dashboard'
    },
    {
      label: 'ניהול משתמשים',
      icon: 'people',
      route: '/users',
      badge: 2
    }
  ];

  contentNavItems: NavItem[] = [
    {
      label: 'ניהול לקוחות',
      icon: 'business',
      route: '/clients'
    },
    {
      label: 'ניהול תיקיות',
      icon: 'folder',
      route: '/folders'
    },
    {
      label: 'ניהול מסמכים',
      icon: 'description',
      route: '/documents'
    }
  ];

  analyticsNavItems: NavItem[] = [
    {
      label: 'דוחות',
      icon: 'assessment',
      route: '/reports'
    },
    {
      label: 'אנליטיקה',
      icon: 'analytics',
      route: '/analytics'
    }
  ];

  constructor(private router: Router) {
    // Listen for window resize
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth <= 768;
    });
  }

  closeSidenav(): void {
    if (this.isMobile) {
      this.toggleSidenav.emit();
    }
  }
}