import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

// Admin sign-in. Lawyers sign in to the lawyers' app; this one is for office admins only.
@Component({
  selector: 'app-login',
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
          <h2>ניהול המשרד במקום אחד.</h2>
          <div class="feature">
            <mat-icon aria-hidden="true">group_add</mat-icon>
            <div><strong>צירוף עורכי דין</strong><span>הזמנה במייל, או קישור להעתקה.</span></div>
          </div>
          <div class="feature">
            <mat-icon aria-hidden="true">insights</mat-icon>
            <div><strong>תמונת מצב</strong><span>משתמשים, תיקים ולקוחות של המשרד.</span></div>
          </div>
          <div class="feature">
            <mat-icon aria-hidden="true">shield</mat-icon>
            <div><strong>הפרדה בין משרדים</strong><span>כל משרד רואה רק את הנתונים שלו.</span></div>
          </div>
        </div>
      </aside>

      <main class="form-panel">
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" novalidate class="form">
          <div>
            <h1>כניסת מנהל משרד</h1>
            <p class="lead">ניהול עורכי הדין וההרשאות של המשרד</p>
          </div>

          @if (errorMessage) {
            <div class="error" role="alert">{{ errorMessage }}</div>
          }

          <mat-form-field appearance="outline">
            <mat-label>אימייל</mat-label>
            <input matInput type="email" formControlName="email" autocomplete="email" dir="ltr" class="ltr-input">
            @if (loginForm.get('email')?.touched && loginForm.get('email')?.invalid) {
              <mat-error>{{ loginForm.get('email')?.hasError('required') ? 'יש להזין אימייל' : 'כתובת האימייל לא תקינה' }}</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>סיסמה</mat-label>
            <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" autocomplete="current-password">
            <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword" [attr.aria-label]="hidePassword ? 'הצגת הסיסמה' : 'הסתרת הסיסמה'">
              <mat-icon>{{ hidePassword ? 'visibility' : 'visibility_off' }}</mat-icon>
            </button>
            @if (loginForm.get('password')?.touched && loginForm.get('password')?.invalid) {
              <mat-error>יש להזין סיסמה</mat-error>
            }
          </mat-form-field>

          <button mat-raised-button color="primary" type="submit" [disabled]="loading" class="submit">
            @if (loading) { <mat-spinner diameter="20"></mat-spinner> } @else { התחברות }
          </button>

          <div class="footer">
            <span>משרד חדש?</span>
            <button type="button" class="link" (click)="goToRegister()">רישום משרד ומנהל</button>
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
    .ltr-input { text-align: right; }
    .submit { width: 100%; height: 44px !important; margin-top: 4px; }
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
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  hidePassword = true;
  errorMessage = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated() && this.authService.isAdmin()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.loading) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.errorMessage = '';

    this.authService.login({ email: this.loginForm.value.email, password: this.loginForm.value.password }).subscribe({
      next: () => {
        this.loading = false;
        // Lawyers can't use the admin app; without this they bounced between login and dashboard
        if (!this.authService.isAdmin()) {
          this.authService.logout(false);
          this.errorMessage = 'החשבון הזה אינו חשבון מנהל. עורכי דין נכנסים דרך אפליקציית עורכי הדין.';
          return;
        }
        this.router.navigate(['/dashboard']);
      },
      error: (error: any) => {
        this.loading = false;
        if (error.status === 401 || error.message === 'פרטי התחברות שגויים') this.errorMessage = 'האימייל או הסיסמה שגויים.';
        else if (error.status === 0) this.errorMessage = 'אין חיבור לשרת. בדקו את החיבור ונסו שוב.';
        else this.errorMessage = error.message || 'ההתחברות נכשלה. נסו שוב.';
      },
    });
  }

  goToRegister(): void {
    this.router.navigate(['/register-admin']);
  }
}
