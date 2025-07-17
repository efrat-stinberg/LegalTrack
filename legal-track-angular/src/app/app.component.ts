import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { AuthService, User } from './services/auth.service';
import { SidenavComponent } from './shared/sidenav/sidenav.component';
import { HeaderComponent } from './shared/header/header.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidenavComponent,
    HeaderComponent
  ],
  template: `
    <div class="app-container" [class.auth-page]="isAuthPage">
      
      <!-- Main Layout with Sidebar (for authenticated users) -->
      @if (!isAuthPage && isAuthenticated) {
        <div class="main-layout">
          
          <!-- Sidebar -->
          <app-sidenav 
            [isOpen]="sidenavOpen" 
            (toggleSidenav)="toggleSidenav()"
            [currentUser]="currentUser">
          </app-sidenav>
          
          <!-- Main Content Area -->
          <div class="main-content" [class.sidebar-open]="sidenavOpen">
            
            <!-- Header -->
            <app-header 
              [currentUser]="currentUser"
              (toggleSidenav)="toggleSidenav()"
              (logout)="logout()">
            </app-header>
            
            <!-- Page Content -->
            <main class="page-content">
              <router-outlet></router-outlet>
            </main>
            
          </div>
        </div>
      }

      <!-- Auth Pages Layout (login/register) -->
      @if (isAuthPage || !isAuthenticated) {
        <div class="auth-layout">
          <router-outlet></router-outlet>
        </div>
      }

    </div>
  `,
  styles: [`
    .app-container {
      height: 100vh;
      width: 100%;
      overflow: hidden;
    }

    .main-layout {
      display: flex;
      height: 100vh;
      position: relative;
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      transition: margin-right 0.3s ease;
      margin-right: 280px;
      overflow: hidden;
    }

    .main-content.sidebar-open {
      margin-right: 280px;
    }

    @media (max-width: 768px) {
      .main-content {
        margin-right: 0;
      }
      
      .main-content.sidebar-open {
        margin-right: 0;
      }
    }

    .page-content {
      flex: 1;
      overflow-y: auto;
      background-color: #fafafa;
    }

    .auth-layout {
      height: 100vh;
      width: 100%;
    }

    .auth-page .main-layout {
      display: none;
    }

    /* Custom scrollbar */
    .page-content::-webkit-scrollbar {
      width: 6px;
    }

    .page-content::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    .page-content::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;
    }

    .page-content::-webkit-scrollbar-thumb:hover {
      background: #a1a1a1;
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'Legal Admin App';
  isAuthPage = false;
  isAuthenticated = false;
  currentUser: User | null = null;
  sidenavOpen = true;

  private authPages = ['/login', '/register-admin'];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Subscribe to route changes to determine if we're on an auth page
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isAuthPage = this.authPages.includes(event.url);
      });

    // Subscribe to authentication status
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      this.isAuthenticated = !!user;
      
      // Redirect to login if not authenticated and not on auth page
      if (!user && !this.isAuthPage) {
        this.router.navigate(['/login']);
      }
    });

    // Initial check for current route
    this.isAuthPage = this.authPages.includes(this.router.url);
  }

  toggleSidenav(): void {
    this.sidenavOpen = !this.sidenavOpen;
  }

  logout(): void {
    this.authService.logout();
  }
}