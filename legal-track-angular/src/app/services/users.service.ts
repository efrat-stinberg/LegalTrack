import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface User {
  userId: number;
  username: string;
  email: string;
  isAdmin: boolean;
  groupId?: number;
  folders?: any[];
}

export interface InviteRequest {
  email: string;
}

export interface InviteResponse {
  token: string;
  // Link to send the lawyer; shown to the admin when the email could not be sent
  inviteLink: string;
  emailSent: boolean;
  emailError?: string | null;
}

export interface Group {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Users Management
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}/users`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/users/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getUserByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/users/${encodeURIComponent(email)}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  updateUser(id: number, userData: Partial<User>): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/users/${id}`, userData)
      .pipe(
        catchError(this.handleError)
      );
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/users/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // A one-time password reset link for a user in the admin's office (the admin passes it on)
  createPasswordResetLink(userId: number): Observable<{ resetLink: string }> {
    return this.http.post<{ resetLink: string }>(`${this.API_URL}/password/admin-link/${userId}`, {});
  }

  // Invite Management - Main function that connects to your endpoint
  inviteLawyer(inviteData: InviteRequest): Observable<InviteResponse> {
    return this.http.post<InviteResponse>(`${this.API_URL}/invite/invite-lawyer`, inviteData)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Group Management
  getAllGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(`${this.API_URL}/group`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getGroupById(id: number): Observable<Group> {
    return this.http.get<Group>(`${this.API_URL}/group/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  createGroup(groupData: Partial<Group>): Observable<Group> {
    return this.http.post<Group>(`${this.API_URL}/group`, groupData)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Error handling
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'שגיאה לא צפויה';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `שגיאת רשת: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = (typeof error.error === 'string' && error.error) || error.error?.message || 'נתונים לא תקינים';
          break;
        case 401:
          errorMessage = 'אין הרשאה לפעולה זו';
          break;
        case 403:
          errorMessage = 'אין גישה לפעולה זו';
          break;
        case 404:
          errorMessage = 'השירות לא נמצא';
          break;
        case 409:
          errorMessage = 'משתמש עם אימייל זה כבר קיים במערכת';
          break;
        case 422:
          errorMessage = 'נתונים לא תקינים';
          break;
        case 500:
          errorMessage = 'שגיאת שרת פנימית';
          break;
        default:
          errorMessage = error.error?.message || `שגיאה: ${error.status}`;
      }
    }

    console.error('Users Service Error:', error);
    return throwError(() => new Error(errorMessage));
  };
}