import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

// Interfaces
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
  user?: User;
  expiresAt?: string;
  refreshToken?: string;
}

export interface User {
  userId: number;
  userName: string;
  email: string;
  isAdmin: boolean;
  groupId: number;
  profilePicture?: string;
  lastLogin?: Date;
  isActive?: boolean;
}

export interface TokenPayload {
  userId: string;
  userName: string;
  email: string;
  isAdmin: boolean;
  groupId: string;
  exp: number;
  iat: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private readonly TOKEN_KEY = 'legal_flow_token';
  private readonly REFRESH_TOKEN_KEY = 'legal_flow_refresh_token';
  private readonly USER_KEY = 'legal_flow_user';

  // BehaviorSubject to track current user state
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  // Track authentication state
  private isAuthenticatedSubject: BehaviorSubject<boolean>;
  public isAuthenticated$: Observable<boolean>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Initialize with stored user data
    const storedUser = this.getStoredUser();
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
    this.currentUser = this.currentUserSubject.asObservable();

    // Initialize authentication state
    this.isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
    this.isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

    // Check token validity on service initialization
    this.checkTokenValidity();
  }

  /**
   * Get current user value synchronously
   */
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Login user with email and password
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.token) {
            this.setSession(response);
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Register new admin user
   */
  registerAdmin(adminData: RegisterAdminRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register-admin`, adminData)
      .pipe(
        tap(response => {
          if (response.token) {
            this.setSession(response);
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Logout user and clear session
   */
  logout(navigateToLogin: boolean = true): void {
    try {
      // Call logout endpoint if user is authenticated
      if (this.isAuthenticated()) {
        this.http.post(`${this.API_URL}/auth/logout`, {}).subscribe({
          error: (error) => console.warn('Logout endpoint error:', error)
        });
      }
    } catch (error) {
      console.warn('Error calling logout endpoint:', error);
    } finally {
      // Always clear local session regardless of API call result
      this.clearSession();
      
      if (navigateToLogin) {
        this.router.navigate(['/login']);
      }
    }
  }

  /**
   * Refresh authentication token
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<AuthResponse>(`${this.API_URL}/auth/refresh`, { 
      refreshToken 
    }).pipe(
      tap(response => {
        if (response.token) {
          this.setSession(response);
        }
      }),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      this.isAuthenticatedSubject.next(false);
      return false;
    }

    try {
      const payload = this.getTokenPayload(token);
      const isValid = payload && payload.exp > Math.floor(Date.now() / 1000);
      this.isAuthenticatedSubject.next(isValid ?? false);
      return isValid ?? false;
    } catch {
      this.isAuthenticatedSubject.next(false);
      return false;
    }
  }

  /**
   * Check if current user is admin
   */
  isAdmin(): boolean {
    const user = this.currentUserValue;
    return user?.isAdmin || false;
  }

  /**
   * Get stored authentication token
   */
  getToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch {
      return null;
    }
  }

  /**
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  /**
   * Get user information from token
   */
  getUserFromToken(): User | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = this.getTokenPayload(token);
      if (!payload) return null;

      return {
        userId: parseInt(payload.userId),
        userName: payload.userName,
        email: payload.email,
        isAdmin: payload.isAdmin,
        groupId: parseInt(payload.groupId)
      };
    } catch {
      return null;
    }
  }

  /**
   * Update current user data
   */
  updateCurrentUser(userData: Partial<User>): void {
    const currentUser = this.currentUserValue;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      this.currentUserSubject.next(updatedUser);
      this.storeUser(updatedUser);
    }
  }

  /**
   * Refresh current user data from storage
   */
  refreshCurrentUser(): void {
    const user = this.getUserFromToken();
    this.currentUserSubject.next(user);
    if (user) {
      this.storeUser(user);
    }
  }

  /**
   * Check if token is about to expire (within 5 minutes)
   */
  isTokenExpiringSoon(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = this.getTokenPayload(token);
      if (!payload) return false;

      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      const fiveMinutes = 5 * 60 * 1000;

      return (expirationTime - currentTime) < fiveMinutes;
    } catch {
      return false;
    }
  }

  /**
   * Get time until token expires (in milliseconds)
   */
  getTimeUntilExpiration(): number {
    const token = this.getToken();
    if (!token) return 0;

    try {
      const payload = this.getTokenPayload(token);
      if (!payload) return 0;

      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();

      return Math.max(0, expirationTime - currentTime);
    } catch {
      return 0;
    }
  }

  /**
   * Private Methods
   */

  /**
   * Set authentication session data
   */
  private setSession(authResponse: AuthResponse): void {
    try {
      // Store token and refresh token
      localStorage.setItem(this.TOKEN_KEY, authResponse.token);
      
      if (authResponse.refreshToken) {
        localStorage.setItem(this.REFRESH_TOKEN_KEY, authResponse.refreshToken);
      }

      // Extract and store user data
      const user = authResponse.user || this.getUserFromToken();
      if (user) {
        this.storeUser(user);
        this.currentUserSubject.next(user);
      }

      // Update authentication state
      this.isAuthenticatedSubject.next(true);
    } catch (error) {
      console.error('Error setting session:', error);
      throw error;
    }
  }

  /**
   * Clear authentication session data
   */
  private clearSession(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      
      this.currentUserSubject.next(null);
      this.isAuthenticatedSubject.next(false);
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  }

  /**
   * Store user data in localStorage
   */
  private storeUser(user: User): void {
    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  }

  /**
   * Get stored user data from localStorage
   */
  private getStoredUser(): User | null {
    try {
      const userData = localStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  /**
   * Check if stored token is valid
   */
  private hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = this.getTokenPayload(token);
      return payload !== null && payload.exp > Math.floor(Date.now() / 1000);
    } catch {
      return false;
    }
  }

  /**
   * Extract payload from JWT token
   */
  private getTokenPayload(token: string): TokenPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = JSON.parse(atob(parts[1]));
      
      // Map JWT claims to our interface
      return {
        userId: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || payload.userId || payload.sub,
        userName: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || payload.userName || payload.name,
        email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || payload.email,
        isAdmin: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] === 'Admin' || payload.isAdmin === true,
        groupId: payload['GroupId'] || payload.groupId,
        exp: payload.exp,
        iat: payload.iat
      };
    } catch (error) {
      console.error('Error parsing token payload:', error);
      return null;
    }
  }

  /**
   * Check token validity and logout if invalid
   */
  private checkTokenValidity(): void {
    if (!this.isAuthenticated()) {
      this.clearSession();
    }
  }

  /**
   * Handle HTTP errors
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = 'Invalid request data';
          break;
        case 401:
          errorMessage = 'Invalid credentials';
          this.logout();
          break;
        case 403:
          errorMessage = 'Access denied';
          break;
        case 404:
          errorMessage = 'Service not found';
          break;
        case 409:
          errorMessage = 'User already exists';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later';
          break;
        default:
          errorMessage = error.error?.message || 'Unknown error occurred';
      }
    }

    console.error('Auth Service Error:', error);
    return throwError(() => new Error(errorMessage));
  };
}