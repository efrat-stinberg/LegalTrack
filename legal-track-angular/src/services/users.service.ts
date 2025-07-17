import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

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
}

export interface Group {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly API_URL = 'https://localhost:7042/api'; // Update with your API URL

  constructor(private http: HttpClient) {}

  // Users Management
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}/users`)
      .pipe(
        catchError(error => {
          console.error('Error fetching users:', error);
          return throwError(() => error);
        })
      );
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/users/${id}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching user:', error);
          return throwError(() => error);
        })
      );
  }

  getUserByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/users/${email}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching user by email:', error);
          return throwError(() => error);
        })
      );
  }

  updateUser(id: number, userData: Partial<User>): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/users/${id}`, userData)
      .pipe(
        catchError(error => {
          console.error('Error updating user:', error);
          return throwError(() => error);
        })
      );
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/users/${id}`)
      .pipe(
        catchError(error => {
          console.error('Error deleting user:', error);
          return throwError(() => error);
        })
      );
  }

  // Invite Management
  inviteLawyer(inviteData: InviteRequest): Observable<InviteResponse> {
    return this.http.post<InviteResponse>(`${this.API_URL}/invite/invite-lawyer`, inviteData)
      .pipe(
        catchError(error => {
          console.error('Error inviting lawyer:', error);
          return throwError(() => error);
        })
      );
  }

  // Group Management
  getAllGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(`${this.API_URL}/group`)
      .pipe(
        catchError(error => {
          console.error('Error fetching groups:', error);
          return throwError(() => error);
        })
      );
  }

  getGroupById(id: number): Observable<Group> {
    return this.http.get<Group>(`${this.API_URL}/group/${id}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching group:', error);
          return throwError(() => error);
        })
      );
  }

  createGroup(groupData: Partial<Group>): Observable<Group> {
    return this.http.post<Group>(`${this.API_URL}/group`, groupData)
      .pipe(
        catchError(error => {
          console.error('Error creating group:', error);
          return throwError(() => error);
        })
      );
  }