import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

export interface UserRole {
  user: boolean;
  superAdmin: boolean;
  staffAdmin: boolean;
  controlAdmin: boolean;
}

export interface UserElement {
  id: number;
  username: string;
  roles: UserRole;
}

export interface RoleDetail {
  role: string;
  features: string[];
}

@Component({
  selector: 'app-role-menu',
  templateUrl: './role-menu.component.html',
  styleUrls: ['./role-menu.component.css']
})
export class RoleMenuComponent implements OnInit {
  @ViewChild('confirmationDialog', { static: true }) confirmationDialog!: TemplateRef<any>;
  @ViewChild('detailRoleDialog', { static: true }) detailRoleDialog!: TemplateRef<any>;

  displayedColumns: string[] = ['id', 'username', 'user', 'super-admin', 'staff-admin', 'control-admin'];
  dataSource = new MatTableDataSource<UserElement>([]);
  selection = new SelectionModel<UserElement>(true, []);

  detailRoleDisplayedColumns: string[] = ['role', 'employeeList', 'roleMenuFunction'];
  detailRoleDataSource = new MatTableDataSource<RoleDetail>([
    { role: 'Super Admin', features: ['employeeList', 'roleMenuFunction'] },
    { role: 'Staff Admin', features: ['employeeList'] },
    { role: 'Control Admin', features: ['roleMenuFunction'] },
    { role: 'User', features: [] }
  ]);

  constructor(private dialog: MatDialog, private http: HttpClient, private authService: AuthService) {}

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    this.getUserData().subscribe(
      (data: UserElement[]) => {
        this.dataSource.data = data;
      },
      (error) => {
        console.error('Failed to load user data', error);
      }
    );
  }

  getUserData(): Observable<UserElement[]> {
    const url = 'http://localhost:8081/api/v1/roles'; // Adjusted URL to match endpoint for fetching user data
    return this.http.get<UserElement[]>(url);
  }

  onRoleSelectionChange(row: UserElement, role: keyof UserRole) {
    if (role === 'user') {
      if (row.roles.user) {
        // User role cannot be removed
        return;
      }
      this.dialog.open(this.confirmationDialog, { data: { row, role } });
    } else {
      if (this.isSuperAdminOrControlAdmin()) {
        this.dialog.open(this.confirmationDialog, { data: { row, role } });
      } else {
        // Handle unauthorized role change attempt
        console.error('You are not authorized to change roles.');
      }
    }
  }

  confirmRoleChange(row: UserElement, role: keyof UserRole) {
    Object.keys(row.roles).forEach(key => row.roles[key as keyof UserRole] = false);
    row.roles[role] = true;
    this.updateCheckboxStates(row);
    this.updateUserRole(row);
  }

  updateCheckboxStates(row: UserElement) {
    const hasActiveRole = Object.values(row.roles).some(value => value);
    if (!hasActiveRole) {
      Object.keys(row.roles).forEach(key => row.roles[key as keyof UserRole] = false);
    }
  }

  isRoleSelected(row: UserElement, role: keyof UserRole): boolean {
    return !row.roles[role] && Object.values(row.roles).some(value => value);
  }

  openDetailRoleDialog() {
    this.dialog.open(this.detailRoleDialog);
  }

  updateUserRole(row: UserElement) {
    const url = `http://localhost:8081/api/v1/roles/${row.id}/role`;
    this.http.put(url, { role: this.getSelectedRole(row.roles) }).subscribe(
      () => {
        console.log('User role updated successfully');
      },
      (error) => {
        console.error('Failed to update user role', error);
      }
    );
  }

  getSelectedRole(roles: UserRole): string {
    if (roles.superAdmin) return 'superAdmin';
    if (roles.staffAdmin) return 'staffAdmin';
    if (roles.controlAdmin) return 'controlAdmin';
    return 'user';
  }

  isSuperAdmin(): boolean {
    return this.authService.getRole() === 'superAdmin';
  }

  isStaffAdmin(): boolean {
    return this.authService.getRole() === 'staffAdmin';
  }

  isControlAdmin(): boolean {
    return this.authService.getRole() === 'controlAdmin';
  }

  isSuperAdminOrControlAdmin(): boolean {
    return this.isSuperAdmin() || this.isControlAdmin();
  }

  isSelf(row: UserElement): boolean {
    return this.authService.getUserId() === row.id.toString();
  }
}
