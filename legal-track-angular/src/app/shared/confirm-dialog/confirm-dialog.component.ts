import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText: string;
  icon?: string;
}

// Replaces the browser's confirm(): same question, in the app's own style. Closes with true on confirm.
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title class="title">
      @if (data.icon) { <mat-icon aria-hidden="true">{{ data.icon }}</mat-icon> }
      {{ data.title }}
    </h2>
    <mat-dialog-content>
      <p class="message">{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button [mat-dialog-close]="false" cdkFocusInitial>ביטול</button>
      <button mat-flat-button color="primary" [mat-dialog-close]="true">{{ data.confirmText }}</button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host { display: block; direction: rtl; text-align: right; }
    .title { display: flex; align-items: center; gap: 8px; }
    .title mat-icon { color: var(--navy-700); }
    .message { margin: 0; color: var(--slate); line-height: 1.6; }
    mat-dialog-actions { gap: 8px; }
  `]
})
export class ConfirmDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData) {}
}
