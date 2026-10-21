import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UsersService, User } from '../../services/users.service';

// Creates a one-time password reset link for a user in the office and shows it for copying,
// for when the user can't get the reset email themselves.
@Component({
  selector: 'app-reset-link-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <h2 mat-dialog-title>קישור לאיפוס סיסמה</h2>
    <mat-dialog-content>
      <p class="muted">עבור <strong>{{ data.username }}</strong> (<bdi dir="ltr">{{ data.email }}</bdi>)</p>

      @if (loading) {
        <div class="state" role="status"><mat-spinner diameter="22"></mat-spinner> יוצרים קישור...</div>
      } @else if (error) {
        <div class="error" role="alert">{{ error }}</div>
      } @else {
        <div class="link-box" role="status">
          <p class="note-title"><mat-icon aria-hidden="true">link</mat-icon> הקישור מוכן</p>
          <p class="muted">העבירו אותו לעורך הדין. הוא חד-פעמי, תקף ל-24 שעות, ומבטל קישורים קודמים.</p>
          <div class="link-row">
            <input class="link-input" [value]="link" readonly aria-label="קישור האיפוס" (focus)="$any($event.target).select()">
            <button mat-stroked-button type="button" (click)="copy()">
              <mat-icon>content_copy</mat-icon> העתקה
            </button>
          </div>
        </div>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-flat-button color="primary" mat-dialog-close>סגירה</button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host { display: block; direction: rtl; text-align: right; }
    .muted { margin: 0 0 12px; color: var(--slate); font-size: 14px; line-height: 1.6; }
    .state { display: flex; align-items: center; gap: 10px; color: var(--slate); padding: 8px 0; }
    .error {
      padding: 10px 14px; border: 1px solid var(--border); border-radius: 6px;
      box-shadow: inset -3px 0 0 var(--ink); background: #FFFFFF; color: var(--ink);
    }
    .link-box { padding: 14px 16px; border: 1px solid var(--border); border-radius: 6px; background: var(--ground); }
    .note-title { display: flex; align-items: center; gap: 6px; margin: 0 0 6px; font-weight: 600; color: var(--ink); font-size: 14px; }
    .note-title mat-icon { font-size: 20px; width: 20px; height: 20px; color: var(--navy-700); }
    .link-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .link-input {
      flex: 1 1 200px; min-width: 0; direction: ltr;
      padding: 9px 10px; border: 1px solid var(--border-strong); border-radius: 4px;
      background: #FFFFFF; color: var(--ink); font: 13px/1.4 monospace;
    }
    .link-input:focus-visible { outline: 2px solid var(--link); outline-offset: 1px; }
  `]
})
export class ResetLinkDialogComponent implements OnInit {
  loading = true;
  link = '';
  error = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: User,
    private usersService: UsersService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.usersService.createPasswordResetLink(this.data.userId).subscribe({
      next: (res) => {
        this.link = res.resetLink;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.status === 404 ? 'המשתמש לא נמצא במשרד.' : 'יצירת הקישור נכשלה. נסו שוב.';
        this.loading = false;
      }
    });
  }

  copy(): void {
    navigator.clipboard.writeText(this.link).then(
      () => this.snackBar.open('הקישור הועתק', 'סגירה', { duration: 3000 }),
      () => this.snackBar.open('לא ניתן להעתיק - סמנו את הקישור והעתיקו ידנית', 'סגירה', { duration: 5000 })
    );
  }
}
