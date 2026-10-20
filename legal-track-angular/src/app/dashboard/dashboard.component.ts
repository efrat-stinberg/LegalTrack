import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService, User } from '../services/auth.service';
import { DashboardService, DashboardStats } from '../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterLink
  ],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>דשבורד ניהול</h1>
        @if (currentUser) {
          <p>שלום, {{ currentUser.userName }}! ברוך הבא לפאנל ניהול הקבוצה</p>
        }
      </div>

      @if (loading) {
        <div class="loading-container">
          <mat-spinner></mat-spinner>
          <p>טוען נתונים...</p>
        </div>
      } @else {
        <div class="dashboard-content">
          @if (error) {
            <p class="error">{{ error }}</p>
          }
          <div class="stats-grid">
            <mat-card class="stat-card">
              <mat-card-content>
                <div class="stat-content">
                  <mat-icon class="stat-icon">people</mat-icon>
                  <div class="stat-info">
                    <h3>{{ stats?.totalUsers ?? 0 }}</h3>
                    <p>משתמשים במשרד</p>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="stat-card">
              <mat-card-content>
                <div class="stat-content">
                  <mat-icon class="stat-icon">folder</mat-icon>
                  <div class="stat-info">
                    <h3>{{ stats?.totalFolders ?? 0 }}</h3>
                    <p>תיקים</p>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="stat-card">
              <mat-card-content>
                <div class="stat-content">
                  <mat-icon class="stat-icon">business_center</mat-icon>
                  <div class="stat-info">
                    <h3>{{ stats?.totalClients ?? 0 }}</h3>
                    <p>לקוחות</p>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>

          <mat-card>
            <mat-card-header>
              <mat-card-title>תיקים אחרונים</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              @if (recentFolders.length === 0) {
                <p>עדיין אין תיקים במשרד. עורכי הדין פותחים תיקים באפליקציית עורכי הדין.</p>
              } @else {
                <ul class="recent-list">
                  @for (folder of recentFolders; track folder.folderId) {
                    <li>
                      <strong>{{ folder.folderName }}</strong>
                      <span> · {{ folder.clientName }} · {{ folder.documentCount }} מסמכים · {{ folder.createdDate | date:'dd/MM/yyyy' }}</span>
                    </li>
                  }
                </ul>
              }
              <div class="actions">
                <button mat-raised-button color="primary" routerLink="/users">
                  <mat-icon>people</mat-icon>
                  ניהול משתמשים
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
    }

    .dashboard-header {
      margin-bottom: 24px;
    }

    .dashboard-header h1 {
      font-family: var(--font-display);
      font-size: 30px;
      font-weight: 600;
      color: var(--navy-900);
      margin-bottom: 4px;
    }

    .dashboard-header p {
      color: var(--slate);
      font-size: 14px;
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

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 4px 0;
    }

    .stat-icon {
      font-size: 22px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      background: var(--ground);
      border: 1px solid var(--border);
      color: var(--navy-700);
    }

    .stat-info h3 {
      font-size: 28px;
      font-weight: 600;
      margin: 0;
      color: var(--navy-900);
      font-variant-numeric: tabular-nums;
    }

    .stat-info p {
      margin: 2px 0 0 0;
      color: var(--slate);
      font-size: 13px;
    }

    .error {
      color: #1A1F2B;
    }

    .recent-list {
      padding-right: 20px;
      line-height: 2;
    }

    .actions {
      margin-top: 20px;
    }

    .actions button {
      margin-left: 10px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  loading = true;
  error: string | null = null;
  stats: DashboardStats | null = null;
  recentFolders: { folderId: number; folderName: string; clientName: string; documentCount: number; createdDate: Date }[] = [];

  constructor(private authService: AuthService, private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;

    // Counts and recent cases of the admin's office
    forkJoin({
      stats: this.dashboardService.getDashboardStats(),
      folders: this.dashboardService.getAllFolders(),
      clients: this.dashboardService.getAllClients()
    }).subscribe({
      next: ({ stats, folders, clients }) => {
        this.stats = stats;
        const clientNames = new Map(clients.map(c => [c.id, c.fullName]));
        this.recentFolders = [...folders]
          .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
          .slice(0, 5)
          .map(f => ({
            folderId: f.folderId,
            folderName: f.folderName,
            clientName: clientNames.get(f.clientId) ?? '',
            documentCount: f.documents?.length ?? 0,
            createdDate: f.createdDate
          }));
        this.loading = false;
      },
      error: () => {
        this.error = 'שגיאה בטעינת נתוני המשרד';
        this.loading = false;
      }
    });
  }
}
