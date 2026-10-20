import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

// Registers a new office together with its admin. Same layout as the admin sign-in screen.
@Component({
  selector: 'app-register-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule, MatIconModule],
  template: `
    <div class="auth">
      <aside class="brand-panel">
        <div class="brand">
          <span class="brand-mark"><mat-icon aria-hidden="true">balance</mat-icon></span>
          <span class="brand-name">LegalTrack</span>
        </div>
        <div class="pitch">
          <h2>פתיחת משרד חדש.</h2>
          <div class="feature">
            <mat-icon aria-hidden="true">badge</mat-icon>
            <div><strong>חשבון מנהל</strong><span>המנהל מצרף את עורכי הדין של המשרד.</span></div>
          </div>
          <div class="feature">
            <mat-icon aria-hidden="true">group_add</mat-icon>
            <div><strong>הזמנת עורכי דין</strong><span>במייל, או בקישור להעתקה.</span></div>
          </div>
          <div class="feature">
            <mat-icon aria-hidden="true">shield</mat-icon>
            <div><strong>הפרדה בין משרדים</strong><span>כל משרד רואה רק את הנתונים שלו.</span></div>
          </div>
        </div>
      </aside>

      <main class="form-panel">
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" novalidate class="form">
          <div>
            <h1>רישום משרד ומנהל</h1>
            <p class="lead">יצירת חשבון מנהל למשרד חדש</p>
          </div>

          @if (errorMessage) {
            <div class="error" role="alert">{{ errorMessage }}</div>
          }

          <mat-form-field appearance="outline">
            <mat-label>שם מלא</mat-label>
            <input matInput formControlName="userName" autocomplete="name">
            @if (registerForm.get('userName')?.hasError('required')) {
              <mat-error>יש להזין שם</mat-error>
            } @else if (registerForm.get('userName')?.hasError('minlength')) {
              <mat-error>השם חייב להכיל לפחות 2 תווים</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>אימייל</mat-label>
            <input matInput type="email" formControlName="email" autocomplete="email" dir="ltr" class="ltr-input">
            @if (registerForm.get('email')?.hasError('required')) {
              <mat-error>יש להזין אימייל</mat-error>
            } @else if (registerForm.get('email')?.hasError('email')) {
              <mat-error>כתובת האימייל לא תקינה</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>סיסמה</mat-label>
            <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" autocomplete="new-password">
            <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword" [attr.aria-label]="hidePassword ? 'הצגת הסיסמה' : 'הסתרת הסיסמה'">
              <mat-icon>{{ hidePassword ? 'visibility' : 'visibility_off' }}</mat-icon>
            </button>
            <mat-hint>לפחות 5 תווים, אותיות ומספרים</mat-hint>
            @if (registerForm.get('password')?.hasError('required')) {
              <mat-error>יש להזין סיסמה</mat-error>
            } @else if (registerForm.get('password')?.hasError('minlength')) {
              <mat-error>הסיסמה חייבת להכיל לפחות 5 תווים</mat-error>
            } @else if (registerForm.get('password')?.hasError('pattern')) {
              <mat-error>הסיסמה חייבת להכיל אותיות ומספרים</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>אישור סיסמה</mat-label>
            <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="confirmPassword" autocomplete="new-password">
            @if (registerForm.get('confirmPassword')?.hasError('required')) {
              <mat-error>יש לאשר את הסיסמה</mat-error>
            }
          </mat-form-field>
          <!-- passwordMismatch is a form-level error, so mat-error inside the field would never show it -->
          @if (registerForm.hasError('passwordMismatch') && registerForm.get('confirmPassword')?.value) {
            <p class="mismatch" role="alert">הסיסמאות אינן זהות</p>
          }

          <button mat-raised-button color="primary" type="submit" [disabled]="registerForm.invalid || loading" class="submit">
            @if (loading) { <mat-spinner diameter="20"></mat-spinner> } @else { יצירת חשבון מנהל }
          </button>

          <div class="footer">
            <span>כבר יש חשבון?</span>
            <button type="button" class="link" (click)="goToLogin()">כניסת מנהל</button>
          </div>
        </form>
      </main>
    </div>
  `,
  styles: [`
    .auth { min-height: 100vh; display: flex; flex-wrap: wrap; background: var(--ground); }
    .brand-panel {
      flex: 1 1 420px;
      background: var(--navy-900);
      color: #C9D3E1;
      padding: 56px;
      display: flex;
      flex-direction: column;
      gap: 40px;
    }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand-mark {
      width: 40px; height: 40px; border-radius: 6px;
      background: var(--navy-700); border: 1px solid var(--navy-500);
      display: flex; align-items: center; justify-content: center; color: #FFFFFF;
    }
    .brand-name { font-family: var(--font-display); font-size: 26px; font-weight: 600; color: #FFFFFF; }
    .pitch { margin: auto 0; max-width: 440px; display: flex; flex-direction: column; gap: 22px; }
    .pitch h2 { font-family: var(--font-display); font-size: 32px; color: #FFFFFF; line-height: 1.3; }
    .feature { display: flex; gap: 14px; }
    .feature mat-icon { color: var(--steel); }
    .feature div { display: flex; flex-direction: column; }
    .feature strong { color: #FFFFFF; font-weight: 600; }
    .feature span { color: #A8B6C9; font-size: 14px; }
    .form-panel { flex: 1 1 480px; display: flex; align-items: center; justify-content: center; padding: 48px 24px; }
    .form { width: 100%; max-width: 400px; display: flex; flex-direction: column; gap: 8px; }
    .form h1 { font-size: 28px; margin-bottom: 4px; }
    .lead { color: var(--slate); margin-bottom: 16px; }
    .error {
      padding: 10px 14px; margin-bottom: 8px;
      border: 1px solid var(--border); border-radius: 6px;
      box-shadow: inset -3px 0 0 var(--ink); background: #FFFFFF;
    }
    .mismatch { margin: -12px 16px 8px; font-size: 13px; color: var(--ink); font-weight: 500; }
    .ltr-input { text-align: right; }
    .submit { width: 100%; height: 44px !important; margin-top: 8px; }
    .submit mat-spinner { margin: 0 auto; }
    .footer { display: flex; gap: 6px; align-items: center; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border); color: var(--slate); font-size: 13px; }
    .link { all: unset; cursor: pointer; color: var(--link); font-weight: 500; }
    .link:hover { text-decoration: underline; }
    .link:focus-visible { outline: 2px solid var(--link); }
    @media (max-width: 900px) {
      .brand-panel { padding: 28px 24px; gap: 0; }
      .pitch { display: none; }
    }
  `]
})
export class RegisterAdminComponent implements OnInit {
  registerForm: FormGroup;
  loading = false;
  hidePassword = true;
  errorMessage = '';

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
    if (this.registerForm.invalid || this.loading) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.errorMessage = '';

    const { confirmPassword, ...adminData } = this.registerForm.value;

    this.authService.registerAdmin(adminData).subscribe({
      next: () => {
        this.loading = false;
        this.snackBar.open('חשבון המנהל נוצר', 'סגירה', { duration: 3000 });
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.loading = false;
        if (error.status === 409) this.errorMessage = 'כבר קיים משתמש עם האימייל הזה.';
        else if (error.status === 0) this.errorMessage = 'אין חיבור לשרת. בדקו את החיבור ונסו שוב.';
        else this.errorMessage = error.error?.message || error.message || 'יצירת החשבון נכשלה. נסו שוב.';
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
