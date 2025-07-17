import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>התחברות למנהל מערכת</mat-card-title>
          <mat-card-subtitle>Legal Flow - Admin Panel</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>אימייל</mat-label>
              <input matInput type="email" formControlName="email" placeholder="admin@example.com">
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                אימייל הוא שדה חובה
              </mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                אימייל לא תקין
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>סיסמה</mat-label>
              <input matInput type="password" formControlName="password" placeholder="••••••••">
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                סיסמה היא שדה חובה
              </mat-error>
              <mat-error *ngIf="loginForm.get('password')?.hasError('minlength')">
                סיסמה חייבת להכיל לפחות 5 תווים
              </mat-error>
            </mat-form-field>

            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit" 
                      [disabled]="loginForm.invalid || loading" class="full-width">
                <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
                <span *ngIf="!loading">התחבר</span>
              </button>
            </div>
          </form>
        </mat-card-content>

        <mat-card-actions align="center">
          <button mat-button color="accent" (click)="goToRegister()">
            יצירת חשבון מנהל חדש
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 20px;
    }

    .full-width {
      width: 100%;
    }

    .form-actions {
      margin-top: 20px;
    }

    mat-card-header {
      text-align: center;
      margin-bottom: 20px;
    }

    mat-card-title {
      font-size: 24px;
      font-weight: 500;
    }

    mat-card-subtitle {
      color: #666;
      margin-top: 8px;
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      
      this.authService.login(this.loginForm.value).subscribe({
        next: (response: { token: string; user: any }) => {
          this.loading = false;
          this.snackBar.open('התחברת בהצלחה!', 'סגור', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/dashboard']);
        },
        error: (error: { status: number; error: { message: string; }; }) => {
          this.loading = false;
          let errorMessage = 'שגיאה בהתחברות';
          
          if (error.status === 401) {
            errorMessage = 'אימייל או סיסמה שגויים';
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }
          
          this.snackBar.open(errorMessage, 'סגור', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  goToRegister(): void {
    this.router.navigate(['/register-admin']);
  }
}