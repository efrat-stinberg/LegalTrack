import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterAdminComponent } from './auth/register-admin/register-admin.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsersComponent } from './users/users.component';
import { AuthGuard, AdminGuard } from './guards/auth.guard';

const routes: Routes = [
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

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    enableTracing: false, // Set to true for debugging
    scrollPositionRestoration: 'top'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }