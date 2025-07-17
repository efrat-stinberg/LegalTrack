import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { DashboardService, DashboardStats, ActivityItem, FolderActivity } from '../services/dashboard.service';
import { AuthService, User } from '../services/auth.service';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard-container">
      <!-- Header Section -->
      <div class="dashboard-header">
        <h1>דשבורד ניהול</h1>
        <p *ngIf="currentUser">שלום, {{ currentUser.userName }}! ברוך הבא לפאנל ניהול הקבוצה</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <mat-spinner></mat-spinner>
        <p>טוען נתונים...</p>
      </div>

      <!-- Dashboard Content -->
      <div *ngIf="!loading && dashboardStats" class="dashboard-content">
        
        <!-- Stats Cards -->
        <div class="stats-grid">
          <mat-card class="stat-card users-card">
            <mat-card-content>
              <div class="stat-content">
                <mat-icon class="stat-icon">people</mat-icon>
                <div class="stat-info">
                  <h3>{{ dashboardStats.totalUsers }}</h3>
                  <p>משתמשים פעילים</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card folders-card">
            <mat-card-content>
              <div class="stat-content">
                <mat-icon class="stat-icon">folder</mat-icon>
                <div class="stat-info">
                  <h3>{{ dashboardStats.totalFolders }}</h3>
                  <p>תיקיות פעילות</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card clients-card">
            <mat-card-content>
              <div class="stat-content">
                <mat-icon class="stat-icon">business</mat-icon>
                <div class="stat-info">
                  <h3>{{ dashboardStats.totalClients }}</h3>
                  <p>לקוחות רשומים</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card activity-card">
            <mat-card-content>
              <div class="stat-content">
                <mat-icon class="stat-icon">timeline</mat-icon>
                <div class="stat-info">
                  <h3>{{ dashboardStats.recentActivity.length }}</h3>
                  <p>פעילויות השבוע</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Charts Section -->
        <div class="charts-section">
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>התפלגות נתונים</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="chart-container">
                <canvas baseChart
                  [data]="pieChartData"
                  [type]="pieChartType"
                  [options]="pieChartOptions">
                </canvas>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>פעילות תיקיות</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="chart-container">
                <canvas baseChart
                  [data]="barChartData"
                  [type]="barChartType"
                  [options]="barChartOptions">
                </canvas>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Activity and Folders Section -->
        <div class="bottom-section">
          <!-- Recent Activity -->
          <mat-card class="activity-card-full">
            <mat-card-header>
              <mat-card-title>פעילות אחרונה</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="activity-list" *ngIf="dashboardStats.recentActivity.length > 0; else noActivity">
                <div class="activity-item" *ngFor="let activity of dashboardStats.recentActivity">
                  <mat-icon class="activity-icon" [ngClass]="getActivityIconClass(activity.type)">
                    {{ getActivityIcon(activity.type) }}
                  </mat-icon>
                  <div class="activity-details">
                    <p class="activity-description">{{ activity.description }}</p>
                    <span class="activity-time">{{ activity.timestamp | date:'dd/MM/yyyy HH:mm' }}</span>
                  </div>
                </div>
              </div>
              <ng-template #noActivity>
                <p class="no-data">אין פעילות אחרונה</p>
              </ng-template>
            </mat-card-content>
          </mat-card>

          <!-- Active Folders -->
          <mat-card class="folders-card-full">
            <mat-card-header>
              <mat-card-title>תיקיות פעילות</mat-card-title>
              <button mat-icon-button (click)="refreshData()">
                <mat-icon>refresh</mat-icon>
              </button>
            </mat-card-header>
            <mat-card-content>
              <div class="folders-list" *ngIf="dashboardStats.activeFolders.length > 0; else noFolders">
                <div class="folder-item" *ngFor="let folder of dashboardStats.activeFolders">
                  <div class="folder-info">
                    <h4>{{ folder.folderName }}</h4>
                    <p>לקוח: {{ folder.clientName }}</p>
                    <div class="folder-stats">
                      <span class="stat-badge">
                        <mat-icon>description</mat-icon>
                        {{ folder.documentCount }} מסמכים
                      </span>
                      <span class="stat-badge">
                        <mat-icon>chat</mat-icon>
                        {{ folder.chatMessages }} הודעות
                      </span>
                    </div>
                  </div>
                  <div class="folder-actions">
                    <button mat-icon-button color="primary" [routerLink]="['/folders', folder.folderId]">
                      <mat-icon>open_in_new</mat-icon>
                    </button>
                  </div>
                </div>
              </div>
              <ng-template #noFolders>
                <p class="no-data">אין תיקיות פעילות</p>
              </ng-template>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header {
      margin-bottom: 30px;
      text-align: center;
    }

    .dashboard-header h1 {
      font-size: 28px;
      font-weight: 300;
      color: #333;
      margin-bottom: 8px;
    }

    .dashboard-header p {
      color: #666;
      font-size: 16px;
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

    .users-card .stat-icon { color: #4CAF50; }
    .folders-card .stat-icon { color: #2196F3; }
    .clients-card .stat-icon { color: #FF9800; }
    .activity-card .stat-icon { color: #9C27B0; }

    .charts-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }

    .chart-card {
      height: 400px;
    }

    .chart-container {
      height: 300px;
      position: relative;
    }

    .bottom-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .activity-card-full,
    .folders-card-full {
      min-height: 400px;
    }

    .activity-list,
    .folders-list {
      max-height: 320px;
      overflow-y: auto;
    }

    .activity-item {
      display: flex;
      align-items: flex-start;
      padding: 12px 0;
      border-bottom: 1px solid #eee;
    }

    .activity-item:last-child {
      border-bottom: none;
    }

    .activity-icon {
      margin-left: 12px;
      margin-top: 2px;
    }

    .activity-icon.folder { color: #2196F3; }
    .activity-icon.user { color: #4CAF50; }
    .activity-icon.document { color: #FF9800; }
    .activity-icon.chat { color: #9C27B0; }

    .activity-details {
      flex: 1;
    }

    .activity-description {
      margin: 0 0 4px 0;
      font-size: 14px;
      color: #333;
    }

    .activity-time {
      font-size: 12px;
      color: #999;
    }

    .folder-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
      border-bottom: 1px solid #eee;
    }

    .folder-item:last-child {
      border-bottom: none;
    }

    .folder-info h4 {
      margin: 0 0 4px 0;
      font-size: 16px;
      color: #333;
    }

    .folder-info p {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: #666;
    }

    .folder-stats {
      display: flex;
      gap: 12px;
    }

    .stat-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #666;
    }

    .stat-badge mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .no-data {
      text-align: center;
      color: #999;
      font-style: italic;
      padding: 40px 0;
    }

    @media (max-width: 768px) {
      .charts-section,
      .bottom-section {
        grid-template-columns: 1fr;
      }
      
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 480px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  dashboardStats: DashboardStats | null = null;
  currentUser: User | null = null;
  loading = true;

  // Chart configurations
  pieChartType: ChartType = 'pie';
  pieChartData: ChartData<'pie'> = {
    labels: ['משתמשים', 'תיקיות', 'לקוחות'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#4CAF50', '#2196F3', '#FF9800'],
      borderWidth: 1
    }]
  };
  pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  barChartType: ChartType = 'bar';
  barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      label: 'מספר מסמכים',
      data: [],
      backgroundColor: '#2196F3',
      borderColor: '#1976D2',
      borderWidth: 1
    }]
  };
  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    
    this.dashboardService.getDashboardStats().subscribe({
      next: (stats) => {
        this.dashboardStats = stats;
        this.updateCharts();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard:', error);
        this.loading = false;
      }
    });
  }

  updateCharts(): void {
    if (!this.dashboardStats) return;

    // Update pie chart
    this.pieChartData.datasets[0].data = [
      this.dashboardStats.totalUsers,
      this.dashboardStats.totalFolders,
      this.dashboardStats.totalClients
    ];

    // Update bar chart with active folders
    const folderNames = this.dashboardStats.activeFolders.map(f => f.folderName);
    const documentCounts = this.dashboardStats.activeFolders.map(f => f.documentCount);
    
    this.barChartData.labels = folderNames;
    this.barChartData.datasets[0].data = documentCounts;
  }

  refreshData(): void {
    this.loadDashboardData();
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'folder_created': return 'folder';
      case 'user_invited': return 'person_add';
      case 'document_uploaded': return 'upload_file';
      case 'chat_message': return 'chat';
      default: return 'info';
    }
  }

  getActivityIconClass(type: string): string {
    switch (type) {
      case 'folder_created': return 'folder';
      case 'user_invited': return 'user';
      case 'document_uploaded': return 'document';
      case 'chat_message': return 'chat';
      default: return '';
    }
  }
}