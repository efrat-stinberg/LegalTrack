import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

// Admin navigation: only screens that exist in this app, plus a link to the lawyers' app.
@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <nav class="sidenav" aria-label="ניווט ראשי">
      <a class="brand" routerLink="/dashboard" (click)="navigate.emit()">
        <span class="brand-mark"><mat-icon aria-hidden="true">balance</mat-icon></span>
        <span class="brand-text">
          <span class="brand-name">LegalTrack</span>
          <span class="brand-sub">ניהול משרד</span>
        </span>
      </a>

      <div class="group">
        <div class="group-title">ניהול המשרד</div>
        @for (item of items; track item.route) {
          <a class="nav-item" [routerLink]="item.route" routerLinkActive="active" ariaCurrentWhenActive="page" (click)="navigate.emit()">
            <mat-icon aria-hidden="true">{{ item.icon }}</mat-icon>
            <span>{{ item.label }}</span>
          </a>
        }
      </div>

      <div class="group">
        <div class="group-title">מעבר</div>
        <a class="nav-item" [href]="lawyersAppUrl" target="_blank" rel="noopener">
          <mat-icon aria-hidden="true">open_in_new</mat-icon>
          <span>אפליקציית עורכי הדין</span>
        </a>
      </div>

      @if (currentUser) {
        <div class="user">
          <span class="avatar" aria-hidden="true">{{ initial }}</span>
          <span class="user-text">
            <span class="user-name">{{ currentUser.userName }}</span>
            <span class="user-role">מנהל משרד</span>
          </span>
        </div>
      }
    </nav>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .sidenav {
      height: 100%;
      box-sizing: border-box;
      background: var(--navy-900);
      color: #C9D3E1;
      padding: 20px 14px;
      display: flex;
      flex-direction: column;
      gap: 24px;
      overflow-y: auto;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0 8px;
      text-decoration: none;
    }
    .brand-mark {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      background: var(--navy-700);
      border: 1px solid var(--navy-500);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
    }
    .brand-mark mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .brand-text { display: flex; flex-direction: column; line-height: 1.2; }
    .brand-name { font-family: var(--font-display); font-size: 20px; font-weight: 600; color: #FFFFFF; }
    .brand-sub { font-size: 12px; color: #8C9AB0; }
    .group { display: flex; flex-direction: column; gap: 4px; }
    .group-title {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.08em;
      color: #8C9AB0;
      padding: 0 10px 6px;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      min-height: 40px;
      padding: 0 10px;
      border-radius: 6px;
      color: #C9D3E1;
      text-decoration: none;
      font-size: 14px;
    }
    .nav-item mat-icon { font-size: 19px; width: 19px; height: 19px; }
    .nav-item:hover { background: rgba(255, 255, 255, 0.06); color: #FFFFFF; }
    .nav-item:focus-visible { outline: 2px solid var(--steel); outline-offset: 1px; }
    .nav-item.active {
      background: var(--navy-700);
      color: #FFFFFF;
      font-weight: 600;
      box-shadow: inset -3px 0 0 var(--steel);
    }
    .user {
      margin-top: auto;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 8px 0;
      border-top: 1px solid #22385A;
    }
    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--navy-700);
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 13px;
    }
    .user-text { display: flex; flex-direction: column; line-height: 1.3; min-width: 0; }
    .user-name { color: #FFFFFF; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .user-role { font-size: 12px; color: #8C9AB0; }
  `]
})
export class SidenavComponent {
  @Input() currentUser: User | null = null;
  @Output() navigate = new EventEmitter<void>();

  lawyersAppUrl = environment.lawyersAppUrl;

  items: NavItem[] = [
    { label: 'סקירה', icon: 'dashboard', route: '/dashboard' },
    { label: 'עורכי דין ומשתמשים', icon: 'group', route: '/users' },
  ];

  get initial(): string {
    return (this.currentUser?.userName || '?').charAt(0).toUpperCase();
  }
}
