import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterAdminRequest {
  userName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

export interface User {
  userId: number;
  userName: string;
  email: string;
  isAdmin: boolean;
  groupId: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'https://localhost:7042/api'; // Update with your API URL
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromToken());
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        map(response => {
          if (response.token) {
            localStorage.setItem('token', response.token);
            this.currentUserSubject.next(this.getUserFromToken());
          }
          return response;
        }),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => error);
        })
      );
  }

  registerAdmin(adminData: RegisterAdminRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register-admin`, adminData)
      .pipe(
        map(response => {
          if (response.token) {
            localStorage.setItem('token', response.token);
            this.currentUserSubject.next(this.getUserFromToken());
          }
          return response;
        }),
        catchError(error => {
          console.error('Register admin error:', error);
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  isAdmin(): boolean {
    const user = this.currentUserValue;
    return user?.isAdmin || false;
  }

  private getUserFromToken(): User | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        userId: parseInt(payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']),
        userName: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
        email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || '',
        isAdmin: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] === 'Admin',
        groupId: parseInt(payload['GroupId'])
      };
    } catch {
      return null;
    }
  }

  refreshCurrentUser(): void {
    this.currentUserSubject.next(this.getUserFromToken());
  }
}