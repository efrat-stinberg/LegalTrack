import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface DashboardStats {
  totalUsers: number;
  totalFolders: number;
  totalClients: number;
  recentActivity: ActivityItem[];
  activeFolders: FolderActivity[];
}

export interface ActivityItem {
  id: number;
  type: 'user_invited' | 'folder_created' | 'document_uploaded' | 'chat_message';
  description: string;
  timestamp: Date;
  userName?: string;
  folderName?: string;
}

export interface FolderActivity {
  folderId: number;
  folderName: string;
  clientName: string;
  documentCount: number;
  lastActivity: Date;
  chatMessages: number;
}

export interface Client {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  folders: any[];
}

export interface Folder {
  folderId: number;
  folderName: string;
  createdDate: Date;
  clientId: number;
  clientName: string;
  documents: any[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly API_URL = 'https://localhost:7042/api'; // Update with your API URL

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<DashboardStats> {
    return forkJoin({
      users: this.http.get<any[]>(`${this.API_URL}/users`),
      folders: this.http.get<Folder[]>(`${this.API_URL}/folders`),
      clients: this.http.get<Client[]>(`${this.API_URL}/client`)
    }).pipe(
      map(({ users, folders, clients }) => {
        return {
          totalUsers: users.length,
          totalFolders: folders.length,
          totalClients: clients.length,
          recentActivity: this.generateRecentActivity(folders, users),
          activeFolders: this.generateActiveFolders(folders)
        };
      }),
      catchError(error => {
        console.error('Error fetching dashboard stats:', error);
        return throwError(() => error);
      })
    );
  }

  getAllClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.API_URL}/client`)
      .pipe(
        catchError(error => {
          console.error('Error fetching clients:', error);
          return throwError(() => error);
        })
      );
  }

  getAllFolders(): Observable<Folder[]> {
    return this.http.get<Folder[]>(`${this.API_URL}/folders`)
      .pipe(
        catchError(error => {
          console.error('Error fetching folders:', error);
          return throwError(() => error);
        })
      );
  }

  getChatHistory(folderId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/chat/${folderId}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching chat history:', error);
          return throwError(() => error);
        })
      );
  }

  private generateRecentActivity(folders: Folder[], users: any[]): ActivityItem[] {
    const activities: ActivityItem[] = [];

    // Generate activity from folders
    folders.slice(0, 5).forEach((folder, index) => {
      activities.push({
        id: index + 1,
        type: 'folder_created',
        description: `תיקייה "${folder.folderName}" נוצרה עבור לקוח ${folder.clientName}`,
        timestamp: new Date(folder.createdDate),
        folderName: folder.folderName
      });
    });

    // Sort by timestamp descending
    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);
  }

  private generateActiveFolders(folders: Folder[]): FolderActivity[] {
    return folders.map(folder => ({
      folderId: folder.folderId,
      folderName: folder.folderName,
      clientName: folder.clientName,
      documentCount: folder.documents?.length || 0,
      lastActivity: new Date(folder.createdDate),
      chatMessages: 0 // This would need to be fetched from chat endpoint
    })).slice(0, 5);
  }
}