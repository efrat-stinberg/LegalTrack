import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { User } from '../../services/auth.service';

// Top bar: menu toggle on small screens, the current page's name, and the user menu.
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatMenuModule],
  template: `
    <header class="topbar">
      <button mat-icon-button class="menu-btn" (click)="toggleSidenav.emit()" aria-label="פתיחת תפריט">
        <mat-icon>menu</mat-icon>
      </button>
      <span class="section">{{ section }}</span>
      <span class="spacer"></span>

      @if (currentUser) {
        <button class="user-btn" [matMenuTriggerFor]="userMenu" aria-label="תפריט משתמש">
          <span class="avatar" aria-hidden="true">{{ initial }}</span>
          <span class="user-text">
            <span class="name">{{ currentUser.userName }}</span>
            <span class="role">מנהל משרד</span>
          </span>
          <mat-icon class="chevron" aria-hidden="true">expand_more</mat-icon>
        </button>
        <mat-menu #userMenu="matMenu" xPosition="after">
          <div class="menu-head">
            <div class="menu-name">{{ currentUser.userName }}</div>
            <div class="menu-email">{{ currentUser.email }}</div>
          </div>
          <button mat-menu-item (click)="logout.emit()">
            <mat-icon>logout</mat-icon>
            <span>יציאה</span>
          </button>
        </mat-menu>
      }
    </header>
  `,
  styles: [`
    .topbar {
      position: sticky;
      top: 0;
      z-index: 10;
      display: flex;
      align-items: center;
      gap: 12px;
      height: 64px;
      padding: 0 32px;
      background: #FFFFFF;
      border-bottom: 1px solid var(--border);
    }
    .menu-btn { display: none; }
    .section { font-size: 14px; color: var(--slate); }
    .spacer { flex: 1; }
    .user-btn {
      all: unset;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      height: 40px;
      padding: 0 8px;
      border-radius: 6px;
    }
    .user-btn:hover { background: var(--ground); }
    .user-btn:focus-visible { outline: 2px solid var(--link); }
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
    .user-text { display: flex; flex-direction: column; line-height: 1.2; }
    .name { font-size: 14px; font-weight: 500; color: var(--ink); }
    .role { font-size: 12px; color: var(--muted); }
    .chevron { color: var(--muted); font-size: 18px; width: 18px; height: 18px; }
    .menu-head { padding: 10px 16px 12px; border-bottom: 1px solid var(--border); margin-bottom: 4px; }
    .menu-name { font-weight: 600; }
    .menu-email { font-size: 13px; color: var(--slate); direction: ltr; text-align: right; }
    @media (max-width: 1024px) {
      .topbar { padding: 0 12px; }
      .menu-btn { display: inline-flex; }
    }
    @media (max-width: 600px) {
      .user-text { display: none; }
    }
  `]
})
export class HeaderComponent implements OnInit {
  @Input() currentUser: User | null = null;
  @Output() toggleSidenav = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  section = '';

  private sections: Record<string, string> = {
    '/dashboard': 'סקירת המשרד',
    '/users': 'עורכי דין ומשתמשים',
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.section = this.sections[this.router.url.split('?')[0]] ?? '';
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: NavigationEnd) => {
      this.section = this.sections[e.urlAfterRedirects.split('?')[0]] ?? '';
    });
  }

  get initial(): string {
    return (this.currentUser?.userName || '?').charAt(0).toUpperCase();
  }
}
