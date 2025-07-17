import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from '@app/auth/login/login.component';
import { RegisterAdminComponent } from '@app/auth/register-admin/register-admin.component';
import { DashboardComponent } from '@app/dashboard/dashboard.component';
import { AdminGuard } from '@app/guards/auth.goard';
import { UsersComponent } from '@app/users/users.component';


const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register-admin', component: RegisterAdminComponent },
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
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    enableTracing: false,
    scrollPositionRestoration: 'top'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }