import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-invite-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>הזמנת עורך דין</h2>

    <mat-dialog-content>
      <form [formGroup]="inviteForm" class="invite-form" (ngSubmit)="onSendInvite()">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>כתובת אימייל</mat-label>
          <input matInput type="email" formControlName="email" dir="ltr" class="ltr-input"
                 placeholder="lawyer@example.com" autocomplete="off" [readonly]="!!inviteLink">
          <mat-icon matSuffix aria-hidden="true">mail_outline</mat-icon>
          @if (inviteForm.get('email')?.hasError('required')) {
            <mat-error>יש להזין אימייל</mat-error>
          } @else if (inviteForm.get('email')?.hasError('email')) {
            <mat-error>כתובת האימייל לא תקינה</mat-error>
          }
        </mat-form-field>
      </form>

      @if (!inviteLink) {
        <div class="note">
          <p class="note-title">מה קורה אחרי השליחה</p>
          <ul>
            <li>נשלח מייל עם קישור הרשמה אישי.</li>
            <li>עורך הדין נרשם דרך הקישור ומצורף למשרד שלך.</li>
            <li>הקישור חד-פעמי ותקף לזמן מוגבל.</li>
          </ul>
        </div>
      } @else {
        <div class="invite-link-box" role="status">
          <p class="note-title">
            <mat-icon aria-hidden="true">link</mat-icon>
            ההזמנה נוצרה, אבל המייל לא נשלח
          </p>
          <p class="muted">אפשר להעביר לעורך הדין את הקישור הזה בדרך אחרת:</p>
          <div class="invite-link-row">
            <input class="invite-link-input" [value]="inviteLink" readonly aria-label="קישור ההזמנה" (focus)="$any($event.target).select()">
            <button mat-stroked-button type="button" (click)="copyLink()">
              <mat-icon>content_copy</mat-icon> העתקה
            </button>
          </div>
          @if (emailError) {
            <p class="email-error">סיבת הכישלון: <bdi>{{ emailError }}</bdi></p>
          }
        </div>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      @if (inviteLink) {
        <button mat-flat-button color="primary" (click)="onCancel()">סגירה</button>
      } @else {
        <button mat-button (click)="onCancel()" [disabled]="loading">ביטול</button>
        <button mat-flat-button color="primary" (click)="onSendInvite()" [disabled]="inviteForm.invalid || loading" class="send">
          @if (loading) {
            <mat-spinner diameter="18"></mat-spinner>
          } @else {
            <mat-icon>send</mat-icon>
          }
          <span>{{ loading ? 'שולח...' : 'שליחת הזמנה' }}</span>
        </button>
      }
    </mat-dialog-actions>
  `,
  styles: [`
    :host { display: block; direction: rtl; text-align: right; }
    .invite-form { padding-top: 8px; }
    .full-width { width: 100%; }
    .ltr-input { text-align: right; }
    .note, .invite-link-box {
      padding: 14px 16px;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: var(--ground);
    }
    .note-title {
      display: flex; align-items: center; gap: 6px;
      margin: 0 0 8px; font-weight: 600; color: var(--ink); font-size: 14px;
    }
    .note-title mat-icon { font-size: 20px; width: 20px; height: 20px; color: var(--navy-700); }
    .note ul { margin: 0; padding-right: 18px; color: var(--slate); font-size: 14px; line-height: 1.6; }
    .muted { margin: 0 0 10px; color: var(--slate); font-size: 14px; }
    .invite-link-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .invite-link-input {
      flex: 1 1 200px; min-width: 0;
      direction: ltr;
      padding: 9px 10px;
      border: 1px solid var(--border-strong);
      border-radius: 4px;
      background: #FFFFFF;
      color: var(--ink);
      font: 13px/1.4 monospace;
    }
    .invite-link-input:focus-visible { outline: 2px solid var(--link); outline-offset: 1px; }
    .email-error { margin: 10px 0 0; color: var(--ink); font-size: 13px; word-break: break-word; }
    mat-dialog-actions { gap: 8px; }
    .send { min-width: 140px; }
    .send mat-spinner { display: inline-block; margin-left: 8px; }
  `]
})
export class InviteUserDialogComponent {
  inviteForm: FormGroup;
  loading = false;
  inviteLink: string | null = null;
  emailError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private dialogRef: MatDialogRef<InviteUserDialogComponent>,
    private snackBar: MatSnackBar
  ) {
    this.inviteForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSendInvite(): void {
    if (this.inviteForm.valid) {
      this.loading = true;
      
      const inviteData = {
        email: this.inviteForm.value.email
      };
      
      this.usersService.inviteLawyer(inviteData).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.emailSent === false) {
            // Keep the dialog open so the admin can copy the link and send it another way
            this.inviteLink = response.inviteLink;
            this.emailError = response.emailError ?? null;
            this.snackBar.open('ההזמנה נוצרה אך המייל לא נשלח - העתיקו את הקישור', 'סגור', {
              duration: 8000,
              panelClass: ['error-snackbar']
            });
            return;
          }
          this.snackBar.open('ההזמנה נשלחה בהצלחה!', 'סגור', {
            duration: 5000,
            panelClass: ['success-snackbar']
          });
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.loading = false;
          
          let errorMessage = 'שגיאה בשליחת ההזמנה';
          
          if (error.message) {
            errorMessage = error.message;
          }
          
          this.snackBar.open(errorMessage, 'סגור', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  copyLink(): void {
    if (!this.inviteLink) return;
    navigator.clipboard.writeText(this.inviteLink).then(
      () => this.snackBar.open('הקישור הועתק', 'סגור', { duration: 3000 }),
      () => this.snackBar.open('לא ניתן להעתיק - סמנו את הקישור והעתיקו ידנית', 'סגור', { duration: 5000 })
    );
  }

  onCancel(): void {
    // After an invite was created (link shown) closing should refresh the users list
    this.dialogRef.close(!!this.inviteLink);
  }
}