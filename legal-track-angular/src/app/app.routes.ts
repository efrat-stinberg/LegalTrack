import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterAdminComponent } from './auth/register-admin/register-admin.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsersComponent } from './users/users.component';
import { AdminGuard } from './guards/auth.goard'; // Note: you might want to rename this file to 'auth.guard.ts'

export const routes: Routes = [
  // Redirect root to dashboard
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  
  // Authentication routes (no guard needed)
  { path: 'login', component: LoginComponent },
  { path: 'register-admin', component: RegisterAdminComponent },
  
  // Protected admin routes
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [AdminGuard],
    data: { title: 'דשבורד ניהול' }
  },
  { 
    path: 'users', 
    component: UsersComponent, 
    canActivate: [AdminGuard],
    data: { title: 'ניהול משתמשים' }
  },
  
  // Future routes for additional features
  // { 
  //   path: 'clients', 
  //   component: ClientsComponent, 
  //   canActivate: [AdminGuard],
  //   data: { title: 'ניהול לקוחות' }
  // },
  // { 
  //   path: 'folders', 
  //   component: FoldersComponent, 
  //   canActivate: [AdminGuard],
  //   data: { title: 'ניהול תיקיות' }
  // },
  // { 
  //   path: 'settings', 
  //   component: SettingsComponent, 
  //   canActivate: [AdminGuard],
  //   data: { title: 'הגדרות מערכת' }
  // },
  
  // Wildcard route - must be last
  { path: '**', redirectTo: '/dashboard' }
];