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
  template: `
    <div class="login-container">
      
      <!-- Background Elements -->
      <div class="background-elements">
        <div class="bg-circle circle-1"></div>
        <div class="bg-circle circle-2"></div>
        <div class="bg-circle circle-3"></div>
      </div>
      
      <!-- Login Card -->
      <div class="login-card-wrapper">
        <mat-card class="login-card">
          
          <!-- Header -->
          <div class="card-header">
            <div class="logo">
              <div class="logo-icon">
                <mat-icon>gavel</mat-icon>
              </div>
              <div class="logo-text">
                <h1>Legal Flow</h1>
                <p>Admin Panel</p>
              </div>
            </div>
            
            <div class="welcome-text">
              <h2>ברוך הבא!</h2>
              <p>התחבר לפאנל הניהול שלך</p>
            </div>
          </div>

          <!-- Login Form -->
          <mat-card-content class="card-content">
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
              
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>כתובת אימייל</mat-label>
                <input matInput 
                       type="email" 
                       formControlName="email" 
                       placeholder="admin@example.com"
                       autocomplete="email">
                <mat-icon matSuffix>email</mat-icon>
                @if (loginForm.get('email')?.hasError('required')) {
                  <mat-error>אימייל הוא שדה חובה</mat-error>
                }
                @if (loginForm.get('email')?.hasError('email')) {
                  <mat-error>כתובת אימייל לא תקינה</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>סיסמה</mat-label>
                <input matInput 
                       [type]="hidePassword ? 'password' : 'text'" 
                       formControlName="password" 
                       placeholder="הכנס סיסמה"
                       autocomplete="current-password">
                <button mat-icon-button 
                        matSuffix 
                        (click)="hidePassword = !hidePassword"
                        type="button"
                        [attr.aria-label]="'הצג סיסמה'"
                        [attr.aria-pressed]="!hidePassword">
                  <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                @if (loginForm.get('password')?.hasError('required')) {
                  <mat-error>סיסמה היא שדה חובה</mat-error>
                }
                @if (loginForm.get('password')?.hasError('minlength')) {
                  <mat-error>סיסמה חייבת להכיל לפחות 5 תווים</mat-error>
                }
              </mat-form-field>

              <!-- Remember Me & Forgot Password -->
              <div class="form-options">
                <mat-checkbox formControlName="rememberMe" class="remember-checkbox">
                  זכור אותי
                </mat-checkbox>
                <button type="button" mat-button class="forgot-password" disabled>
                  שכחת סיסמה?
                </button>
              </div>

              <!-- Submit Button -->
              <button mat-raised-button 
                      color="primary" 
                      type="submit" 
                      class="submit-button"
                      [disabled]="loginForm.invalid || loading">
                @if (loading) {
                  <mat-spinner diameter="20"></mat-spinner>
                  <span>מתחבר...</span>
                } @else {
                  <ng-container>
                    <mat-icon>login</mat-icon>
                    <span>התחבר</span>
                  </ng-container>
                }
              </button>

            </form>
          </mat-card-content>

          <!-- Footer -->
          <mat-divider></mat-divider>
          
          <mat-card-actions class="card-footer">
            <div class="footer-content">
              <p>אין לך חשבון מנהל עדיין?</p>
              <button mat-button 
                      color="accent" 
                      (click)="goToRegister()"
                      class="register-button">
                <mat-icon>person_add</mat-icon>
                צור חשבון מנהל
              </button>
            </div>
          </mat-card-actions>

        </mat-card>
        
        <!-- Additional Info -->
        <div class="additional-info">
          <div class="info-item">
            <mat-icon>security</mat-icon>
            <span>מאובטח באמצעות הצפנה מתקדמת</span>
          </div>
          <div class="info-item">
            <mat-icon>support_agent</mat-icon>
            <span>תמיכה טכנית 24/7</span>
          </div>
          <div class="info-item">
            <mat-icon>cloud_done</mat-icon>
            <span>גיבוי אוטומטי בענן</span>
          </div>
        </div>
      </div>
      
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      position: relative;
      overflow: hidden;
    }

    /* Background Elements */
    .background-elements {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      z-index: 0;
    }

    .bg-circle {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      animation: float 6s ease-in-out infinite;
    }

    .circle-1 {
      width: 200px;
      height: 200px;
      top: 10%;
      left: 10%;
      animation-delay: 0s;
    }

    .circle-2 {
      width: 150px;
      height: 150px;
      top: 60%;
      right: 15%;
      animation-delay: 2s;
    }

    .circle-3 {
      width: 300px;
      height: 300px;
      bottom: -50px;
      left: -50px;
      animation-delay: 4s;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(180deg); }
    }

    /* Login Card Wrapper */
    .login-card-wrapper {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 440px;
    }

    /* Login Card */
    .login-card {
      border-radius: 24px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(20px);
      background: rgba(255, 255, 255, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.2);
      overflow: hidden;
      transition: transform 0.3s ease;
    }

    .login-card:hover {
      transform: translateY(-5px);
    }

    /* Card Header */
    .card-header {
      padding: 40px 40px 20px 40px;
      text-align: center;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    }

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    .logo-icon {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
    }

    .logo-icon mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: white;
    }

    .logo-text h1 {
      font-size: 28px;
      font-weight: 700;
      margin: 0;
      color: #1a1a1a;
      letter-spacing: -0.5px;
    }

    .logo-text p {
      font-size: 14px;
      color: #666;
      margin: 4px 0 0 0;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .welcome-text h2 {
      font-size: 24px;
      font-weight: 600;
      margin: 0 0 8px 0;
      color: #1a1a1a;
    }

    .welcome-text p {
      font-size: 16px;
      color: #666;
      margin: 0;
      font-weight: 400;
    }

    /* Card Content */
    .card-content {
      padding: 32px 40px !important;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .form-field {
      width: 100%;
    }

    .form-field .mat-mdc-form-field-wrapper {
      border-radius: 12px;
    }

    .form-field .mat-mdc-text-field-wrapper {
      border-radius: 12px;
    }

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: -8px 0 8px 0;
    }

    .remember-checkbox {
      font-size: 14px;
      color: #666;
    }

    .forgot-password {
      font-size: 14px;
      color: #2196F3;
      font-weight: 500;
      padding: 0;
      min-width: auto;
    }

    .forgot-password:disabled {
      color: #ccc;
    }

    .submit-button {
      height: 56px;
      border-radius: 16px;
      font-size: 16px;
      font-weight: 600;
      letter-spacing: 0.5px;
      box-shadow: 0 4px 20px rgba(33, 150, 243, 0.3);
      transition: all 0.3s ease;
    }

    .submit-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(33, 150, 243, 0.4);
    }

    .submit-button:disabled {
      opacity: 0.7;
      transform: none;
    }

    .submit-button mat-spinner {
      margin-left: 12px;
    }

    .submit-button mat-icon {
      margin-left: 8px;
    }

    /* Card Footer */
    .card-footer {
      padding: 24px 40px 32px 40px !important;
      background: rgba(248, 249, 250, 0.5);
    }

    .footer-content {
      width: 100%;
      text-align: center;
    }

    .footer-content p {
      margin: 0 0 16px 0;
      color: #666;
      font-size: 14px;
    }

    .register-button {
      border-radius: 12px;
      font-weight: 600;
      padding: 12px 24px;
      border: 2px solid #667eea;
      color: #667eea;
      transition: all 0.3s ease;
    }

    .register-button:hover {
      background: #667eea;
      color: white;
      transform: translateY(-1px);
    }

    .register-button mat-icon {
      margin-left: 8px;
    }

    /* Additional Info */
    .additional-info {
      margin-top: 32px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 24px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 12px;
      color: white;
      font-size: 14px;
      font-weight: 500;
    }

    .info-item mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      opacity: 0.9;
    }

    /* Loading State */
    .loading .login-card {
      pointer-events: none;
      opacity: 0.8;
    }

    /* Error States */
    .mat-mdc-form-field.mat-form-field-invalid .mat-mdc-text-field-wrapper {
      border-color: #f44336 !important;
    }

    .mat-mdc-form-field.mat-form-field-invalid .mat-mdc-floating-label {
      color: #f44336 !important;
    }

    /* Success States */
    .mat-mdc-form-field.ng-valid.ng-touched .mat-mdc-text-field-wrapper {
      border-color: #4caf50 !important;
    }

    /* Responsive Design */
    @media (max-width: 600px) {
      .login-container {
        padding: 16px;
      }

      .login-card {
        border-radius: 20px;
      }

      .card-header {
        padding: 32px 24px 16px 24px;
      }

      .card-content {
        padding: 24px !important;
      }

      .card-footer {
        padding: 20px 24px 28px 24px !important;
      }

      .logo {
        flex-direction: column;
        gap: 12px;
      }

      .logo-text h1 {
        font-size: 24px;
      }

      .welcome-text h2 {
        font-size: 20px;
      }

      .form-options {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .additional-info {
        margin-top: 24px;
        padding: 20px;
      }

      .info-item {
        font-size: 13px;
      }
    }

    @media (max-width: 480px) {
      .circle-1,
      .circle-2,
      .circle-3 {
        display: none;
      }

      .login-card {
        border-radius: 16px;
      }

      .card-header {
        padding: 24px 20px 12px 20px;
      }

      .card-content {
        padding: 20px !important;
      }

      .card-footer {
        padding: 16px 20px 24px 20px !important;
      }
    }

    /* Accessibility */
    @media (prefers-reduced-motion: reduce) {
      .bg-circle {
        animation: none;
      }
      
      .login-card,
      .submit-button,
      .register-button {
        transition: none;
      }
    }

    /* High contrast mode */
    @media (prefers-contrast: high) {
      .login-card {
        border: 2px solid #000;
      }
      
      .submit-button {
        border: 2px solid #000;
      }
    }

    /* Focus indicators */
    .submit-button:focus-visible,
    .register-button:focus-visible {
      outline: 3px solid #2196F3;
      outline-offset: 2px;
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  hidePassword = true;

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

    // Add some demo data for development
    this.loginForm.patchValue({
      email: 'admin@legal-flow.com',
      password: 'admin123'
    });
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
          
          // Small delay to show success message
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