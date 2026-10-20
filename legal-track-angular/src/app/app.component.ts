import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import { AuthService, User } from './services/auth.service';
import { SidenavComponent } from './shared/sidenav/sidenav.component';
import { HeaderComponent } from './shared/header/header.component';

// App shell: fixed navigation column (an overlay on small screens), top bar, and the page.
@Component({
  standalone: true,
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidenavComponent],
  template: `
    @if (!isAuthPage && isAuthenticated) {
      <div class="shell" [class.nav-open]="sidenavOpen">
        <app-sidenav class="sidebar" [currentUser]="currentUser" (navigate)="onNavigate()"></app-sidenav>
        @if (isSmallScreen && sidenavOpen) {
          <div class="backdrop" (click)="sidenavOpen = false" aria-hidden="true"></div>
        }
        <div class="main">
          <app-header [currentUser]="currentUser" (toggleSidenav)="toggleSidenav()" (logout)="logout()"></app-header>
          <main class="page">
            <router-outlet></router-outlet>
          </main>
        </div>
      </div>
    } @else {
      <router-outlet></router-outlet>
    }
  `,
  styles: [`
    .shell {
      display: flex;
      min-height: 100vh;
      background: var(--ground);
    }
    .sidebar {
      flex: 0 0 248px;
      position: sticky;
      top: 0;
      height: 100vh;
    }
    .main {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }
    .page {
      flex: 1;
      width: 100%;
      max-width: 1360px;
      margin: 0 auto;
      box-sizing: border-box;
      padding: 24px 32px 40px;
    }
    .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 30, 51, 0.4);
      z-index: 20;
    }
    @media (max-width: 1024px) {
      .sidebar {
        position: fixed;
        top: 0;
        right: 0;
        z-index: 30;
        width: 248px;
        transform: translateX(100%);
        transition: transform 0.2s ease;
      }
      .shell.nav-open .sidebar {
        transform: none;
      }
      .page {
        padding: 20px 16px 32px;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'LegalTrack Admin';
  isAuthPage = false;
  isAuthenticated = false;
  currentUser: User | null = null;
  sidenavOpen = true;
  isSmallScreen = false;

  private authPages = ['/login', '/register-admin'];

  private isAuthUrlInAddressBar(): boolean {
    const path = window.location.hash.replace(/^#/, '').split('?')[0];
    return this.authPages.includes(path);
  }

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isAuthPage = this.authPages.includes(event.urlAfterRedirects.split('?')[0]);
      });

    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      this.isAuthenticated = !!user;
      // On first load router.url is still "/" before routing finishes, so also check the address bar
      if (!user && !this.isAuthPage && !this.isAuthUrlInAddressBar()) {
        this.router.navigate(['/login']);
      }
    });

    this.isAuthPage = this.authPages.includes(this.router.url);
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  checkScreenSize(): void {
    this.isSmallScreen = window.innerWidth <= 1024;
    this.sidenavOpen = !this.isSmallScreen;
  }

  toggleSidenav(): void {
    this.sidenavOpen = !this.sidenavOpen;
  }

  onNavigate(): void {
    if (this.isSmallScreen) this.sidenavOpen = false;
  }

  logout(): void {
    this.authService.logout();
  }
}
