import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UsersService, User } from '../services/users.service';
import { InviteUserDialogComponent } from './invite-user-dialog/invite-user-dialog.component';

@Component({
  selector: 'app-users',
  template: `
    <div class="users-container">
      <!-- Header -->
      <div class="page-header">
        <h1>ניהול משתמשים</h1>
        <button mat-raised-button color="primary" (click)="openInviteDialog()">
          <mat-icon>person_add</mat-icon>
          הזמן עורך דין
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <mat-spinner></mat-spinner>
        <p>טוען משתמשים...</p>
      </div>

      <!-- Users Table -->
      <mat-card *ngIf="!loading" class="users-card">
        <mat-card-header>
          <mat-card-title>רשימת משתמשים בקבוצה</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <!-- Search Filter -->
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>חיפוש משתמשים</mat-label>
            <input matInput (keyup)="applyFilter($event)" placeholder="חפש לפי שם או אימייל">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <!-- Table -->
          <div class="table-container">
            <table mat-table [dataSource]="dataSource" matSort class="users-table">
              
              <!-- ID Column -->
              <ng-container matColumnDef="userId">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>מזהה</th>
                <td mat-cell *matCellDef="let user">{{ user.userId }}</td>
              </ng-container>

              <!-- Name Column -->
              <ng-container matColumnDef="username">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>שם משתמש</th>
                <td mat-cell *matCellDef="let user">
                  <div class="user-name">
                    <mat-icon *ngIf="user.isAdmin" class="admin-icon">admin_panel_settings</mat-icon>
                    {{ user.username }}
                  </div>
                </td>
              </ng-container>

              <!-- Email Column -->
              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>אימייל</th>
                <td mat-cell *matCellDef="let user">{{ user.email }}</td>
              </ng-container>

              <!-- Role Column -->
              <ng-container matColumnDef="isAdmin">
                <th mat-header-cell *matHeaderCellDef>תפקיד</th>
                <td mat-cell *matCellDef="let user">
                  <mat-chip-set>
                    <mat-chip [class]="user.isAdmin ? 'admin-chip' : 'user-chip'">
                      {{ user.isAdmin ? 'מנהל' : 'עורך דין' }}
                    </mat-chip>
                  </mat-chip-set>
                </td>
              </ng-container>

              <!-- Group Column -->
              <ng-container matColumnDef="groupId">
                <th mat-header-cell *matHeaderCellDef>קבוצה</th>
                <td mat-cell *matCellDef="let user">{{ user.groupId || 'לא שויך' }}</td>
              </ng-container>

              <!-- Folders Count Column -->
              <ng-container matColumnDef="foldersCount">
                <th mat-header-cell *matHeaderCellDef>תיקיות</th>
                <td mat-cell *matCellDef="let user">
                  <span class="folders-count">{{ user.folders?.length || 0 }}</span>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>פעולות</th>
                <td mat-cell *matCellDef="let user">
                  <div class="actions-buttons">
                    <button mat-icon-button color="primary" 
                            [matTooltip]="'עריכת ' + user.username"
                            (click)="editUser(user)">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button color="accent"
                            [matTooltip]="'הצגת פרטי ' + user.username"
                            (click)="viewUser(user)">
                      <mat-icon>visibility</mat-icon>
                    </button>
                    <button mat-icon-button color="warn"
                            [matTooltip]="'מחיקת ' + user.username"
                            (click)="deleteUser(user)"
                            [disabled]="user.isAdmin">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>

            <!-- No Data Message -->
            <div *ngIf="dataSource.data.length === 0" class="no-data">
              <mat-icon>people_outline</mat-icon>
              <p>אין משתמשים להצגה</p>
            </div>
          </div>

          <!-- Paginator -->
          <mat-paginator [pageSizeOptions]="[5, 10, 20]" 
                         showFirstLastButtons
                         [pageSize]="10">
          </mat-paginator>
        </mat-card-content>
      </mat-card>

      <!-- Statistics Cards -->
      <div class="stats-section" *ngIf="!loading">
        <mat-card class="stat-card total-users">
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

        <mat-card class="stat-card admin-users">
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

        <mat-card class="stat-card regular-users">
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

    .table-container {
      overflow-x: auto;
      margin-bottom: 20px;
    }

    .users-table {
      width: 100%;
      min-width: 800px;
    }

    .user-name {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .admin-icon {
      color: #f44336;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .admin-chip {
      background-color: #f44336;
      color: white;
    }

    .user-chip {
      background-color: #4caf50;
      color: white;
    }

    .folders-count {
      background-color: #e3f2fd;
      color: #1976d2;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .actions-buttons {
      display: flex;
      gap: 4px;
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

    .total-users .stat-icon { color: #2196F3; }
    .admin-users .stat-icon { color: #f44336; }
    .regular-users .stat-icon { color: #4CAF50; }

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
  displayedColumns: string[] = ['userId', 'username', 'email', 'isAdmin', 'groupId', 'foldersCount', 'actions'];
  dataSource = new MatTableDataSource<User>();
  loading = true;

  totalUsers = 0;
  adminUsers = 0;
  regularUsers = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private usersService: UsersService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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
        this.snackBar.open('שגיאה בטעינת המשתמשים', 'סגור', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.loading = false;
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

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openInviteDialog(): void {
    const dialogRef = this.dialog.open(InviteUserDialogComponent, {
      width: '400px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers(); // Refresh the list after invitation
      }
    });
  }

  editUser(user: User): void {
    // TODO: Implement edit user dialog
    this.snackBar.open('עריכת משתמש - בפיתוח', 'סגור', {
      duration: 3000
    });
  }

  viewUser(user: User): void {
    // TODO: Implement view user details dialog
    this.snackBar.open(`הצגת פרטי ${user.username} - בפיתוח`, 'סגור', {
      duration: 3000
    });
  }

  deleteUser(user: User): void {
    if (user.isAdmin) {
      this.snackBar.open('לא ניתן למחוק משתמש מנהל', 'סגור', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (confirm(`האם אתה בטוח שברצונך למחוק את המשתמש ${user.username}?`)) {
      this.usersService.deleteUser(user.userId).subscribe({
        next: () => {
          this.snackBar.open('המשתמש נמחק בהצלחה', 'סגור', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.snackBar.open('שגיאה במחיקת המשתמש', 'סגור', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }
}