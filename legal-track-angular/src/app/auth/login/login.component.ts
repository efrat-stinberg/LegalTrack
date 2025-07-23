import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthResponse, AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatCheckboxModule,
    MatDividerModule
  ],
  styleUrls: [
    './login.component.css',
    './login-features.component.css', 
    './login-form.component.css',
    './login-responsive.component.css'
  ],
  template: `
    <div class="login-container">
      
      <!-- Enhanced Background with Particles -->
      <div class="background-wrapper">
        <div class="particle-field">
          @for (i of particleArray; track i) {
            <div class="particle" [style.animation-delay.s]="getRandomDelay()"></div>
          }
        </div>
        <div class="gradient-orbs">
          <div class="orb orb-1"></div>
          <div class="orb orb-2"></div>
          <div class="orb orb-3"></div>
          <div class="orb orb-4"></div>
        </div>
        <div class="geometric-shapes">
          <div class="shape shape-triangle"></div>
          <div class="shape shape-circle"></div>
          <div class="shape shape-square"></div>
        </div>
      </div>
      
      <!-- Main Horizontal Content -->
      <div class="content-wrapper">
        
        <!-- Left Side - Branding & Features -->
        <div class="left-section">
          
          <!-- Brand Header -->
          <div class="brand-header">
            <div class="logo-section">
              <div class="logo-container">
                <div class="logo-background"></div>
                <div class="logo-icon">
                  <mat-icon>gavel</mat-icon>
                  <div class="icon-glow"></div>
                </div>
              </div>
              
              <div class="brand-info">
                <h1 class="brand-title">
                  <span class="title-part">Legal</span>
                  <span class="title-part accent">Flow</span>
                </h1>
                <p class="brand-subtitle">
                  <span class="subtitle-icon">✨</span>
                  Admin Panel Premium
                  <span class="subtitle-badge">Pro</span>
                </p>
              </div>
            </div>
            
            <div class="welcome-section">
              <h2 class="welcome-title">ברוכים הבאים!</h2>
              <p class="welcome-text">
                התחברו לחוויה מתקדמת של ניהול משרד עורכי דין
              </p>
              <div class="header-decoration">
                <div class="decoration-line"></div>
                <div class="decoration-diamond"></div>
                <div class="decoration-line"></div>
              </div>
            </div>
          </div>
          
          <!-- Features Grid - Horizontal Layout -->
          <div class="features-section">
            <div class="features-grid">
              <div class="feature-card">
                <div class="feature-icon security">
                  <mat-icon>security</mat-icon>
                </div>
                <div class="feature-content">
                  <h4>אבטחה מתקדמת</h4>
                  <p>הצפנה ברמה בנקאית</p>
                </div>
              </div>
              
              <div class="feature-card">
                <div class="feature-icon cloud">
                  <mat-icon>cloud_done</mat-icon>
                </div>
                <div class="feature-content">
                  <h4>גיבוי אוטומטי</h4>
                  <p>נתונים מאובטחים בענן</p>
                </div>
              </div>
              
              <div class="feature-card">
                <div class="feature-icon support">
                  <mat-icon>support_agent</mat-icon>
                </div>
                <div class="feature-content">
                  <h4>תמיכה 24/7</h4>
                  <p>צוות מומחים זמין תמיד</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Additional Info Cards -->
          <div class="info-cards">
            <div class="info-card">
              <mat-icon class="info-icon">trending_up</mat-icon>
              <div class="info-text">
                <span class="info-title">יעילות מוכחת</span>
                <span class="info-subtitle">חיסכון של 40% בזמן העבודה</span>
              </div>
            </div>
            
            <div class="info-card">
              <mat-icon class="info-icon">groups</mat-icon>
              <div class="info-text">
                <span class="info-title">מעל 1,000 לקוחות</span>
                <span class="info-subtitle">משרדי עורכי דין מובילים</span>
              </div>
            </div>
          </div>
          
        </div>
        
        <!-- Right Side - Login Form -->
        <div class="right-section">
          
          <!-- Floating Login Card -->
          <div class="login-card-container">
            <div class="card-glow"></div>
            <mat-card class="login-card">
              
              <!-- Form Header -->
              <div class="form-header">
                <h3 class="form-title">התחברות למערכת</h3>
                <p class="form-subtitle">הכניסו את פרטי ההתחברות שלכם</p>
              </div>

              <!-- Enhanced Form Section -->
              <mat-card-content class="card-content">
                <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="premium-form">
                  
                  <!-- Email Field with Enhanced Design -->
                  <div class="form-group">
                    <mat-form-field appearance="outline" class="premium-field">
                      <mat-label>כתובת אימייל</mat-label>
                      <input matInput 
                             type="email" 
                             formControlName="email" 
                             placeholder="admin@legalflow.co.il"
                             autocomplete="email">
                      <mat-icon matPrefix class="field-icon">alternate_email</mat-icon>
                      <div class="field-decoration"></div>
                      @if (loginForm.get('email')?.hasError('required')) {
                        <mat-error>
                          <mat-icon>error_outline</mat-icon>
                          אימייל הוא שדה חובה
                        </mat-error>
                      }
                      @if (loginForm.get('email')?.hasError('email')) {
                        <mat-error>
                          <mat-icon>error_outline</mat-icon>
                          כתובת אימייל לא תקינה
                        </mat-error>
                      }
                    </mat-form-field>
                  </div>

                  <!-- Password Field with Enhanced Design -->
                  <div class="form-group">
                    <mat-form-field appearance="outline" class="premium-field">
                      <mat-label>סיסמה</mat-label>
                      <input matInput 
                             [type]="hidePassword ? 'password' : 'text'" 
                             formControlName="password" 
                             placeholder="הכניסו סיסמה מאובטחת"
                             autocomplete="current-password">
                      <mat-icon matPrefix class="field-icon">lock</mat-icon>
                      <button mat-icon-button 
                              matSuffix 
                              (click)="hidePassword = !hidePassword"
                              type="button"
                              class="password-toggle"
                              [attr.aria-label]="'הצג סיסמה'"
                              [attr.aria-pressed]="!hidePassword">
                        <mat-icon class="toggle-icon">
                          {{ hidePassword ? 'visibility_off' : 'visibility' }}
                        </mat-icon>
                      </button>
                      <div class="field-decoration"></div>
                      @if (loginForm.get('password')?.hasError('required')) {
                        <mat-error>
                          <mat-icon>error_outline</mat-icon>
                          סיסמה היא שדה חובה
                        </mat-error>
                      }
                      @if (loginForm.get('password')?.hasError('minlength')) {
                        <mat-error>
                          <mat-icon>error_outline</mat-icon>
                          סיסמה חייבת להכיל לפחות 5 תווים
                        </mat-error>
                      }
                    </mat-form-field>
                  </div>

                  <!-- Enhanced Options Section -->
                  <div class="form-options">
                    <mat-checkbox formControlName="rememberMe" class="premium-checkbox">
                      <span class="checkbox-text">
                        <mat-icon class="checkbox-icon">memory</mat-icon>
                        זכור אותי למשך 30 יום
                      </span>
                    </mat-checkbox>
                    <button type="button" mat-button class="forgot-password" disabled>
                      <mat-icon>help_outline</mat-icon>
                      שכחתם סיסמה?
                    </button>
                  </div>

                  <!-- Premium Submit Button -->
                  <button mat-raised-button 
                          color="primary" 
                          type="submit" 
                          class="premium-submit-button"
                          [disabled]="loginForm.invalid || loading">
                    <div class="button-content">
                      @if (loading) {
                        <mat-spinner diameter="20" class="button-spinner"></mat-spinner>
                        <span class="button-text">מתחבר...</span>
                        <div class="loading-dots">
                          <span class="dot"></span>
                          <span class="dot"></span>
                          <span class="dot"></span>
                        </div>
                      } @else {
                        <mat-icon class="button-icon">login</mat-icon>
                        <span class="button-text">התחבר למערכת</span>
                        <mat-icon class="button-arrow">arrow_back</mat-icon>
                      }
                      <div class="button-glow"></div>
                    </div>
                  </button>

                </form>
              </mat-card-content>

              <!-- Enhanced Footer -->
              <mat-divider class="premium-divider"></mat-divider>
              
              <mat-card-actions class="card-footer">
                <div class="footer-content">
                  <div class="footer-text">
                    <mat-icon class="footer-icon">admin_panel_settings</mat-icon>
                    <span>אין לכם חשבון מנהל עדיין?</span>
                  </div>
                  <button mat-raised-button 
                          color="accent" 
                          (click)="goToRegister()"
                          class="premium-register-button">
                    <div class="button-shine"></div>
                    <mat-icon>person_add</mat-icon>
                    <span>צרו חשבון מנהל</span>
                    <mat-icon class="button-arrow">arrow_back</mat-icon>
                  </button>
                </div>
              </mat-card-actions>

            </mat-card>
          </div>
          
        </div>
        
      </div>
      
    </div>
  `
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  hidePassword = true;
  particleArray = Array(30).fill(0); // For particle effect

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(5)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Check if already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // Add demo data for development
    this.loginForm.patchValue({
      email: 'admin@legal-flow.com',
      password: 'admin123'
    });

    // Randomly position particles
    this.initializeParticles();
  }

  private initializeParticles(): void {
    setTimeout(() => {
      const particles = document.querySelectorAll('.particle');
      particles.forEach((particle, index) => {
        const element = particle as HTMLElement;
        element.style.left = Math.random() * 100 + '%';
        element.style.animationDelay = Math.random() * 15 + 's';
        element.style.animationDuration = (15 + Math.random() * 10) + 's';
      });
    }, 100);
  }

  getRandomDelay(): number {
    return Math.random() * 15;
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.loading) {
      this.loading = true;
      
      const loginData = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };
      
      this.authService.login(loginData).subscribe({
        next: (response: AuthResponse) => {
          this.loading = false;
          this.showSuccess('התחברת בהצלחה! מעביר לדשבורד...');
          
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1000);
        },
        error: (error: any) => {
          this.loading = false;
          this.handleLoginError(error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  goToRegister(): void {
    this.router.navigate(['/register-admin']);
  }

  private handleLoginError(error: any): void {
    let errorMessage = 'שגיאה בהתחברות';
    
    if (error.status === 401) {
      errorMessage = 'אימייל או סיסמה שגויים';
    } else if (error.status === 403) {
      errorMessage = 'אין לך הרשאות מנהל';
    } else if (error.status === 429) {
      errorMessage = 'יותר מדי ניסיונות התחברות. נסה שוב מאוחר יותר';
    } else if (error.status === 0) {
      errorMessage = 'שגיאת רשת. בדוק את החיבור לאינטרנט';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }
    
    this.showError(errorMessage);
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'סגור', {
      duration: 4000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'סגור', {
      duration: 6000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }
}