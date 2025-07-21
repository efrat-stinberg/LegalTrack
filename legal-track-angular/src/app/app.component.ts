import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

// Import services
import { AuthService, User } from './services/auth.service';
import { SidenavComponent } from './shared/sidenav/sidenav.component';
import { HeaderComponent } from './shared/header/header.component';

// Import improved components - we'll create these

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    SidenavComponent
  ],
  template: `
    <div class="app-container" [class.auth-page]="isAuthPage">
      
      <!-- Loading Overlay -->
      @if (isLoading) {
        <div class="loading-overlay">
          <div class="spinner"></div>
          <p>טוען...</p>
        </div>
      }

      <!-- Main Layout with Sidebar (for authenticated users) -->
      @if (!isAuthPage && isAuthenticated) {
        <div class="main-layout">
          
          <!-- Sidebar -->
          <app-sidenav 
            [isOpen]="sidenavOpen" 
            (toggleSidenav)="toggleSidenav()"
            [currentUser]="currentUser"
            class="sidebar">
          </app-sidenav>
          
          <!-- Main Content Area -->
          <div class="main-content" [class.sidebar-open]="sidenavOpen">
            
            <!-- Header -->
            <app-header 
              [currentUser]="currentUser"
              (toggleSidenav)="toggleSidenav()"
              (logout)="logout()"
              class="header">
            </app-header>
            
            <!-- Page Content -->
            <main class="page-content">
              <div class="content-wrapper">
                <router-outlet></router-outlet>
              </div>
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
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      position: relative;
    }

    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.95);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      backdrop-filter: blur(5px);
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #2196F3;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .loading-overlay p {
      color: #666;
      font-size: 16px;
      font-weight: 500;
    }

    .main-layout {
      display: flex;
      min-height: 100vh;
      position: relative;
    }

    .sidebar {
      position: fixed;
      top: 0;
      right: 0;
      height: 100vh;
      z-index: 1000;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      transition: margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      margin-right: 0;
    }

    .main-content.sidebar-open {
      margin-right: 280px;
    }

    .header {
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
    }

    .page-content {
      flex: 1;
      overflow-y: auto;
      background: transparent;
      position: relative;
    }

    .content-wrapper {
      min-height: calc(100vh - 64px);
      padding: 24px;
      max-width: 1440px;
      margin: 0 auto;
    }

    .auth-layout {
      min-height: 100vh;
      width: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    /* Custom scrollbar for page content */
    .page-content::-webkit-scrollbar {
      width: 6px;
    }

    .page-content::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.05);
      border-radius: 3px;
    }

    .page-content::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 3px;
      transition: background 0.2s;
    }

    .page-content::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 0, 0, 0.3);
    }

    /* Desktop breakpoints */
    @media (min-width: 1200px) {
      .main-content.sidebar-open {
        margin-right: 300px;
      }
    }

    /* Tablet breakpoints */
    @media (max-width: 1024px) {
      .main-content {
        margin-right: 0 !important;
      }
      
      .content-wrapper {
        padding: 20px;
      }
    }

    /* Mobile breakpoints */
    @media (max-width: 768px) {
      .content-wrapper {
        padding: 16px;
      }
      
      .main-content {
        margin-right: 0 !important;
      }
    }

    @media (max-width: 480px) {
      .content-wrapper {
        padding: 12px;
      }
    }

    /* Smooth transitions for all elements */
    * {
      transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
    }

    /* Focus states for accessibility */
    *:focus-visible {
      outline: 2px solid #2196F3;
      outline-offset: 2px;
    }

    /* Dark mode support preparation */
    @media (prefers-color-scheme: dark) {
      .app-container {
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      }
      
      .loading-overlay {
        background: rgba(26, 26, 46, 0.95);
      }
      
      .loading-overlay p {
        color: #ccc;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'Legal Flow Admin';
  isAuthPage = false;
  isAuthenticated = false;
  currentUser: User | null = null;
  sidenavOpen = true;
  isLoading = false;

  private authPages = ['/login', '/register-admin'];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initializeApp();
  }

  private async initializeApp(): Promise<void> {
    this.isLoading = true;

    try {
      // Subscribe to route changes
      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event: NavigationEnd) => {
          this.isAuthPage = this.authPages.includes(event.url);
        });

      // Subscribe to authentication status
      this.authService.currentUser.subscribe(user => {
        this.currentUser = user;
        this.isAuthenticated = !!user;
        
        // Redirect logic
        if (!user && !this.isAuthPage) {
          this.router.navigate(['/login']);
        }
      });

      // Initial checks
      this.isAuthPage = this.authPages.includes(this.router.url);
      
      // Check initial screen size
      this.checkScreenSize();
      
      // Listen for screen size changes
      window.addEventListener('resize', () => this.checkScreenSize());

    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      // Delay to show loading state
      setTimeout(() => {
        this.isLoading = false;
      }, 500);
    }
  }

  private checkScreenSize(): void {
    if (window.innerWidth <= 1024) {
      this.sidenavOpen = false;
    } else {
      this.sidenavOpen = true;
    }
  }

  toggleSidenav(): void {
    this.sidenavOpen = !this.sidenavOpen;
  }

  logout(): void {
    this.isLoading = true;
    
    setTimeout(() => {
      this.authService.logout();
      this.isLoading = false;
    }, 300);
  }
}