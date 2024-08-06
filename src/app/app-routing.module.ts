import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './component/register.component';
import { LoginComponent } from './component/login.component';
import { ProfileComponent } from './component/profile.component';
import { DashboardComponent } from './component/dashboard.component';
import { EmployeeComponent } from './component/employee.component';
import { RoleMenuComponent } from './component/role-menu.component';
import { AuthGuard } from './guards/auth.guard';
import { InfoPageComponent } from './component/information-page.component';

const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'info-page', component: InfoPageComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { 
    path: 'employee-list', 
    component: EmployeeComponent
  },
  { 
    path: 'role-menu', 
    component: RoleMenuComponent
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
