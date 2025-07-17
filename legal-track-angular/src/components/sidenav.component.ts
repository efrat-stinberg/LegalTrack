import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-sidenav',
  template: `
    <nav class="sidenav" [class.open]="isOpen">
      
      <!-- Logo Section -->
      <div class="logo-section">
        <div class="logo">
          <mat-icon class="logo-icon">gavel</mat-icon>
          <span class="logo-text" *ngIf="isOpen">Legal Flow</span>
        </div>
        <span class="admin-badge" *ngIf="isOpen">Admin Panel</span>
      </div>

      <!-- User Info Section -->
      <div class="user-section" *ngIf="currentUser && isOpen">
        <div class="user-avatar">
          <mat-icon>account_circle</mat-icon>
        </div>
        <div class="user-info">
          <p class="user-name">{{ currentUser.userName }}</p>
          <p class="user-role">{{ currentUser.isAdmin ? 'מנהל מערכת' : 'עורך דין' }}</p>
        </div>
      </div>

      <!-- Navigation Menu -->
      <div class="nav-menu">
        <div class="nav-section">
          <h3 class="section-title" *ngIf="isOpen">ניהול כללי</h3>
          
          <a *ngFor="let item of mainNavItems" 
             [routerLink]="item.route"
             routerLinkActive="active"
             class="nav-item"
             [matTooltip]="!isOpen ? item.label : ''"
             [matTooltipPosition]="'left'">
            <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
            <span class="nav-label" *ngIf="isOpen">{{ item.label }}</span>
            <span class="nav-badge" *ngIf="item.badge && isOpen">{{ item.badge }}</span>
          </a>
        </div>

        <div class="nav-section" *ngIf="futureNavItems.length > 0">
          <h3 class="section-title" *ngIf="isOpen">ניהול תוכן</h3>
          
          <a *ngFor="let item of futureNavItems" 
             [routerLink]="item.route"
             routerLinkActive="active"
             class="nav-item disabled"
             [matTooltip]="!isOpen ? item.label + ' (בפיתוח)' : ''"
             [matTooltipPosition]="'left'">
            <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
            <span class="nav-label" *ngIf="isOpen">{{ item.label }}</span>
            <span class="coming-soon" *ngIf="isOpen">בקרוב</span>
          </a>
        </div>
      </div>

      <!-- Bottom Actions -->
      <div class="nav-bottom">
        <a class="nav-item disabled" 
           [matTooltip]="!isOpen ? 'הגדרות (בפיתוח)' : ''"
           [matTooltipPosition]="'left'">
          <mat-icon class="nav-icon">settings</mat-icon>
          <span class="nav-label" *ngIf="isOpen">הגדרות</span>
        </a>

        <button class="nav-item help-button" 
                [matTooltip]="!isOpen ? 'עזרה' : ''"
                [matTooltipPosition]="'left'">
          <mat-icon class="nav-icon">help</mat-icon>
          <span class="nav-label" *ngIf="isOpen">עזרה</span>
        </button>
      </div>

    </nav>

    <!-- Overlay for mobile -->
    <div class="sidenav-overlay" 
         *ngIf="isOpen && isMobile" 
         (click)="closeSidenav()">
    </div>
  `,
  styles: [`
    .sidenav {
      position: fixed;
      top: 0;
      right: 0;
      height: 100vh;
      width: 280px;
      background: linear-gradient(180deg, #1e3c72 0%, #2a5298 100%);
      color: white;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
    }

    .sidenav.open {
      transform: translateX(0);
    }

    .logo-section {
      padding: 24px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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
    }

    .logo-text {
      font-size: 24px;
      font-weight: 600;
      letter-spacing: -0.5px;
    }

    .admin-badge {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.7);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .user-section {
      padding: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-avatar mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: rgba(255, 255, 255, 0.8);
    }

    .user-info {
      flex: 1;
    }

    .user-name {
      margin: 0 0 4px 0;
      font-weight: 500;
      font-size: 16px;
    }

    .user-role {
      margin: 0;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.7);
    }

    .nav-menu {
      flex: 1;
      padding: 20px 0;
      overflow-y: auto;
    }

    .nav-section {
      margin-bottom: 32px;
    }

    .section-title {
      font-size: 12px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.6);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 0 0 16px 20px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      padding: 12px 20px;
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      transition: all 0.2s ease;
      position: relative;
      gap: 16px;
      cursor: pointer;
      border: none;
      background: none;
      width: 100%;
      text-align: right;
    }

    .nav-item:hover:not(.disabled) {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }

    .nav-item.active {
      background: rgba(255, 255, 255, 0.15);
      color: white;
    }

    .nav-item.active::before {
      content: '';
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: #ffd700;
    }

    .nav-item.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .nav-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      flex-shrink: 0;
    }

    .nav-label {
      flex: 1;
      font-size: 14px;
      font-weight: 500;
    }

    .nav-badge {
      background: #f44336;
      color: white;
      font-size: 10px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 10px;
      min-width: 18px;
      text-align: center;
    }

    .coming-soon {
      font-size: 10px;
      color: #ffd700;
      font-weight: 500;
      background: rgba(255, 215, 0, 0.2);
      padding: 2px 6px;
      border-radius: 4px;
    }

    .nav-bottom {
      padding: 20px 0;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
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
      background: rgba(0, 0, 0, 0.5);
      z-index: 999;
    }

    /* Custom scrollbar for nav menu */
    .nav-menu::-webkit-scrollbar {
      width: 4px;
    }

    .nav-menu::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
    }

    .nav-menu::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 2px;
    }

    .nav-menu::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.5);
    }

    @media (max-width: 768px) {
      .sidenav {
        width: 280px;
        transform: translateX(100%);
      }
    }

    @media (min-width: 769px) {
      .sidenav-overlay {
        display: none;
      }
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
      route: '/users'
    }
  ];

  futureNavItems: NavItem[] = [
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
      label: 'דוחות ואנליטיקה',
      icon: 'analytics',
      route: '/reports'
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