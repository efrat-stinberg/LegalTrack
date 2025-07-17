import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register-admin',
  template: `
    <div class="register-container">
      <mat-card class="register-card">
        <mat-card-header>
          <mat-card-title>יצירת חשבון מנהל</mat-card-title>
          <mat-card-subtitle>Legal Flow - Admin Panel</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>שם מלא</mat-label>
              <input matInput formControlName="userName" placeholder="הכנס שם מלא">
              <mat-error *ngIf="registerForm.get('userName')?.hasError('required')">
                שם משתמש הוא שדה חובה
              </mat-error>
              <mat-error *ngIf="registerForm.get('userName')?.hasError('minlength')">
                שם משתמש חייב להכיל לפחות 2 תווים
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>אימייל</mat-label>
              <input matInput type="email" formControlName="email" placeholder="admin@example.com">
              <mat-error *ngIf="registerForm.get('email')?.hasError('required')">
                אימייל הוא שדה חובה
              </mat-error>
              <mat-error *ngIf="registerForm.get('email')?.hasError('email')">
                אימייל לא תקין
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>סיסמה</mat-label>
              <input matInput type="password" formControlName="password" placeholder="••••••••">
              <mat-error *ngIf="registerForm.get('password')?.hasError('required')">
                סיסמה היא שדה חובה
              </mat-error>
              <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">
                סיסמה חייבת להכיל לפחות 5 תווים
              </mat-error>
              <mat-error *ngIf="registerForm.get('password')?.hasError('pattern')">
                סיסמה חייבת להכיל אותיות ומספרים
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>אישור סיסמה</mat-label>
              <input matInput type="password" formControlName="confirmPassword" placeholder="••••••••">
              <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('required')">
                אישור סיסמה הוא שדה חובה
              </mat-error>
              <mat-error *ngIf="registerForm.hasError('passwordMismatch')">
                הסיסמאות אינן זהות
              </mat-error>
            </mat-form-field>

            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit" 
                      [disabled]="registerForm.invalid || loading" class="full-width">
                <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
                <span *ngIf="!loading">צור חשבון מנהל</span>
              </button>
            </div>
          </form>
        </mat-card-content>

        <mat-card-actions align="center">
          <button mat-button color="accent" (click)="goToLogin()">
            כבר יש לך חשבון? התחבר
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .register-card {
      width: 100%;
      max-width: 450px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .register-form {
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
export class RegisterAdminComponent implements OnInit {
  registerForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      userName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(5), Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      
      const { confirmPassword, ...adminData } = this.registerForm.value;
      
      this.authService.registerAdmin(adminData).subscribe({
        next: (response: any) => {
          this.loading = false;
          this.snackBar.open('חשבון המנהל נוצר בהצלחה!', 'סגור', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/dashboard']);
        },
        error: (error:any) => {
          this.loading = false;
          let errorMessage = 'שגיאה ביצירת החשבון';
          
          if (error.status === 409) {
            errorMessage = 'משתמש עם אימייל זה כבר קיים';
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

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}