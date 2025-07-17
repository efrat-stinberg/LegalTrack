import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register-admin',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
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
              @if (registerForm.get('userName')?.hasError('required')) {
                <mat-error>שם משתמש הוא שדה חובה</mat-error>
              }
              @if (registerForm.get('userName')?.hasError('minlength')) {
                <mat-error>שם משתמש חייב להכיל לפחות 2 תווים</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>אימייל</mat-label>
              <input matInput type="email" formControlName="email" placeholder="admin@example.com">
              @if (registerForm.get('email')?.hasError('required')) {
                <mat-error>אימייל הוא שדה חובה</mat-error>
              }
              @if (registerForm.get('email')?.hasError('email')) {
                <mat-error>אימייל לא תקין</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>סיסמה</mat-label>
              <input matInput type="password" formControlName="password" placeholder="••••••••">
              @if (registerForm.get('password')?.hasError('required')) {
                <mat-error>סיסמה היא שדה חובה</mat-error>
              }
              @if (registerForm.get('password')?.hasError('minlength')) {
                <mat-error>סיסמה חייבת להכיל לפחות 5 תווים</mat-error>
              }
              @if (registerForm.get('password')?.hasError('pattern')) {
                <mat-error>סיסמה חייבת להכיל אותיות ומספרים</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>אישור סיסמה</mat-label>
              <input matInput type="password" formControlName="confirmPassword" placeholder="••••••••">
              @if (registerForm.get('confirmPassword')?.hasError('required')) {
                <mat-error>אישור סיסמה הוא שדה חובה</mat-error>
              }
              @if (registerForm.hasError('passwordMismatch')) {
                <mat-error>הסיסמאות אינן זהות</mat-error>
              }
            </mat-form-field>

            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit" 
                      [disabled]="registerForm.invalid || loading" class="full-width">
                @if (loading) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  <span>צור חשבון מנהל</span>
                }
              </button>
            </div>
          </form>
        </mat-card-content>

        <mat-card-actions align="end">
          <button mat-button color="accent" (click)="goToLogin()">
            כבר יש לך חשבון? התחבר
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`/* אותם styles כמו בlogin */`]
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
        next: (response) => {
          this.loading = false;
          this.snackBar.open('חשבון המנהל נוצר בהצלחה!', 'סגור', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
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