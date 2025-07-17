import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InviteUserDialogComponent } from './invite-user-dialog/invite-user-dialog.component';
import { UsersService, User } from '../services/users.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule
  ],
  template: `
    <div class="users-container">
      <div class="page-header">
        <h1>ניהול משתמשים</h1>
        <button mat-raised-button color="primary" (click)="openInviteDialog()">
          <mat-icon>person_add</mat-icon>
          הזמן עורך דין
        </button>
      </div>

      @if (loading) {
        <div class="loading-container">
          <mat-spinner></mat-spinner>
          <p>טוען משתמשים...</p>
        </div>
      } @else {
        <mat-card class="users-card">
          <mat-card-header>
            <mat-card-title>רשימת משתמשים בקבוצה</mat-card-title>
          </mat-card-header>
          
          <mat-card-content>
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>חיפוש משתמשים</mat-label>
              <input matInput (keyup)="applyFilter($event)" placeholder="חפש לפי שם או אימייל">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <div class="no-data">
              <mat-icon>people_outline</mat-icon>
              <p>אין משתמשים להצגה</p>
              <p>השתמש בכפתור "הזמן עורך דין" להוספת משתמשים חדשים</p>
            </div>
          </mat-card-content>
        </mat-card>

        <div class="stats-section">
          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-content">
                <mat-icon class="stat-icon">people</mat-icon>
                <div class="stat-info">
                  <h3>{{ totalUsers }}</h3>
                  <p>סך המשתמשים</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-content">
                <mat-icon class="stat-icon">admin_panel_settings</mat-icon>
                <div class="stat-info">
                  <h3>{{ adminUsers }}</h3>
                  <p>מנהלים</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-content">
                <mat-icon class="stat-icon">person</mat-icon>
                <div class="stat-info">
                  <h3>{{ regularUsers }}</h3>
                  <p>עורכי דין</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .users-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .page-header h1 {
      font-size: 28px;
      font-weight: 300;
      color: #333;
      margin: 0;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
    }

    .loading-container p {
      margin-top: 16px;
      color: #666;
    }

    .users-card {
      margin-bottom: 30px;
    }

    .search-field {
      width: 100%;
      max-width: 400px;
      margin-bottom: 20px;
    }

    .no-data {
      text-align: center;
      padding: 40px;
      color: #999;
    }

    .no-data mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      color: #ccc;
    }

    .stats-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .stat-card {
      height: 120px;
    }

    .stat-content {
      display: flex;
      align-items: center;
      height: 100%;
    }

    .stat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-left: 16px;
      color: #2196F3;
    }

    .stat-info h3 {
      font-size: 32px;
      font-weight: 600;
      margin: 0;
      color: #333;
    }

    .stat-info p {
      margin: 4px 0 0 0;
      color: #666;
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
      }

      .stats-section {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class UsersComponent implements OnInit {
  loading = false;
  dataSource = new MatTableDataSource<User>();
  
  totalUsers = 1;
  adminUsers = 1;
  regularUsers = 0;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private usersService: UsersService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    
    this.usersService.getAllUsers().subscribe({
      next: (users) => {
        this.dataSource.data = users;
        this.updateStatistics(users);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading = false;
        // Show placeholder data if API fails
        this.updateStatistics([]);
      }
    });
  }

  updateStatistics(users: User[]): void {
    this.totalUsers = users.length;
    this.adminUsers = users.filter(u => u.isAdmin).length;
    this.regularUsers = users.filter(u => !u.isAdmin).length;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openInviteDialog(): void {
    const dialogRef = this.dialog.open(InviteUserDialogComponent, {
      width: '500px',
      disableClose: true,
      direction: 'rtl',
      panelClass: 'invite-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Refresh the users list after successful invitation
        this.loadUsers();
      }
    });
  }
}