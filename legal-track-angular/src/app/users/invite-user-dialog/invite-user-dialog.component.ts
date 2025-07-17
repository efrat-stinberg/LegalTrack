import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-invite-user-dialog',
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
            <mat-error *ngIf="inviteForm.get('email')?.hasError('required')">
              אימייל הוא שדה חובה
            </mat-error>
            <mat-error *ngIf="inviteForm.get('email')?.hasError('email')">
              כתובת אימייל לא תקינה
            </mat-error>
          </mat-form-field>

          <div class="form-info">
            <mat-icon class="info-icon">info</mat-icon>
            <div class="info-text">
              <p><strong>מה יקרה לאחר השליחה:</strong></p>
              <ul>
                <li>המערכת תשלח אימייל הזמנה לכתובת שהוזנה</li>
                <li>עורך הדין יוכל להירשם באמצעות קישור מיוחד</li>
                <li>לאחר ההרשמה הוא יתווסף אוטומטית לקבוצה שלך</li>
                <li>ההזמנה תפוג תוך 15 דקות</li>
              </ul>
            </div>
          </div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()" [disabled]="loading">
          ביטול
        </button>
        <button mat-raised-button color="primary" 
                (click)="onSendInvite()" 
                [disabled]="inviteForm.invalid || loading">
          <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
          <mat-icon *ngIf="!loading">send</mat-icon>
          <span *ngIf="!loading">שלח הזמנה</span>
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      min-width: 400px;
      max-width: 500px;
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
    }

    mat-dialog-actions {
      padding-top: 20px;
    }

    mat-dialog-actions button {
      margin-right: 8px;
    }

    .error {
      border-color: #f44336 !important;
    }

    mat-spinner {
      margin-left: 8px;
    }

    button[mat-raised-button] {
      min-width: 140px;
    }
  `]
})
export class InviteUserDialogComponent {
  inviteForm: FormGroup;
  loading = false;

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
      
      this.usersService.inviteLawyer(this.inviteForm.value).subscribe({
        next: (response) => {
          this.loading = false;
          this.snackBar.open('ההזמנה נשלחה בהצלחה!', 'סגור', {
            duration: 5000,
            panelClass: ['success-snackbar']
          });
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.loading = false;
          let errorMessage = 'שגיאה בשליחת ההזמנה';
          
          if (error.status === 400) {
            errorMessage = 'כתובת אימייל לא תקינה';
          } else if (error.status === 409) {
            errorMessage = 'משתמש עם אימייל זה כבר קיים במערכת';
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

  onCancel(): void {
    this.dialogRef.close(false);
  }
}