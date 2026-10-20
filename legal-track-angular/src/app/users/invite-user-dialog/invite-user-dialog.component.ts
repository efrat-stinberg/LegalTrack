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
    <div class="dialog-container">
      <h2 mat-dialog-title>הזמנת עורך דין חדש</h2>
      
      <mat-dialog-content>
        <form [formGroup]="inviteForm" class="invite-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>כתובת אימייל</mat-label>
            <input matInput type="email" formControlName="email" 
                   placeholder="lawyer@example.com"
                   [class.error]="inviteForm.get('email')?.invalid && inviteForm.get('email')?.touched">
            <mat-icon matSuffix>email</mat-icon>
            @if (inviteForm.get('email')?.hasError('required')) {
              <mat-error>אימייל הוא שדה חובה</mat-error>
            }
            @if (inviteForm.get('email')?.hasError('email')) {
              <mat-error>כתובת אימייל לא תקינה</mat-error>
            }
          </mat-form-field>

          <div class="form-info">
            <mat-icon class="info-icon">info</mat-icon>
            <div class="info-text">
              <p><strong>מה יקרה לאחר השליחה:</strong></p>
              <ul>
                <li>המערכת תשלח אימייל הזמנה לכתובת שהוזנה</li>
                <li>עורך הדין יוכל להירשם באמצעות קישור מיוחד</li>
                <li>לאחר ההרשמה הוא יתווסף אוטומטית לקבוצה שלך</li>
                <li>ההזמנה תקפה לזמן מוגבל ולשימוש חד-פעמי</li>
              </ul>
            </div>
          </div>
        </form>

        @if (inviteLink) {
          <div class="invite-link-box">
            <p><strong>ההזמנה נוצרה, אבל המייל לא נשלח.</strong></p>
            <p>אפשר להעביר לעורך הדין את הקישור הזה (למשל בוואטסאפ):</p>
            <div class="invite-link-row">
              <input class="invite-link-input" [value]="inviteLink" readonly (focus)="$any($event.target).select()">
              <button mat-stroked-button type="button" (click)="copyLink()">
                <mat-icon>content_copy</mat-icon> העתק
              </button>
            </div>
            @if (emailError) {
              <p class="email-error">סיבת הכישלון: {{ emailError }}</p>
            }
          </div>
        }
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()" [disabled]="loading">
          ביטול
        </button>
        <button mat-raised-button color="primary" 
                (click)="onSendInvite()" 
                [disabled]="inviteForm.invalid || loading">
          @if (loading) {
            <mat-spinner diameter="20"></mat-spinner>
          } @else {
            <mat-icon>send</mat-icon>
          }
          <span>{{ loading ? 'שולח...' : 'שלח הזמנה' }}</span>
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .invite-link-box {
      margin-top: 16px;
      padding: 12px;
      border-radius: 8px;
      background: #fff8e1;
      border: 1px solid #ffe082;
    }
    .invite-link-row {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .invite-link-input {
      flex: 1;
      direction: ltr;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 12px;
    }
    .email-error {
      color: #b71c1c;
      font-size: 12px;
      word-break: break-word;
    }
    .dialog-container {
      min-width: 400px;
      max-width: 500px;
      padding: 20px;
    }

    .invite-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin: 20px 0;
    }

    .full-width {
      width: 100%;
    }

    .form-info {
      display: flex;
      gap: 12px;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 8px;
      border-right: 4px solid #2196F3;
    }

    .info-icon {
      color: #2196F3;
      margin-top: 2px;
      flex-shrink: 0;
    }

    .info-text {
      flex: 1;
    }

    .info-text p {
      margin: 0 0 8px 0;
      font-weight: 500;
      color: #333;
    }

    .info-text ul {
      margin: 0;
      padding-right: 16px;
      color: #666;
    }

    .info-text li {
      margin-bottom: 4px;
      font-size: 14px;
      line-height: 1.4;
    }

    mat-dialog-title {
      color: #333;
      margin-bottom: 0;
      font-size: 20px;
      font-weight: 500;
    }

    mat-dialog-actions {
      padding-top: 20px;
      gap: 8px;
    }

    .error {
      border-color: #f44336 !important;
    }

    button[mat-raised-button] {
      min-width: 140px;
    }

    mat-spinner {
      margin-left: 8px;
    }

    mat-dialog-content {
      max-height: 60vh;
      overflow-y: auto;
    }

    /* RTL Support */
    .dialog-container {
      direction: rtl;
      text-align: right;
    }

    mat-dialog-actions {
      direction: rtl;
    }

    .form-info {
      direction: rtl;
    }

    .info-text ul {
      text-align: right;
    }
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