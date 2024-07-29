import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../services/user.service';
import { UserRoleDto } from '../models/user-role.dto';

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
  dataSource = new MatTableDataSource<UserRoleDto>([]);

  detailRoleDisplayedColumns: string[] = ['role', 'features'];
  detailRoleDataSource = new MatTableDataSource<RoleDetail>([
    { role: 'Super Admin', features: ['employeeList', 'roleMenuFunction'] },
    { role: 'Staff Admin', features: ['employeeList'] },
    { role: 'Control Admin', features: ['roleMenuFunction'] },
    { role: 'User', features: [] }
  ]);

  constructor(
    private dialog: MatDialog,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    this.userService.getAllUsers().subscribe(
      (data: UserRoleDto[]) => {
        this.dataSource.data = data;
      },
      (error) => {
        console.error('Failed to load user data', error);
      }
    );
  }

  openDetailRoleDialog() {
    this.dialog.open(this.detailRoleDialog);
  }

  onRoleSelectionChange(row: UserRoleDto, role: keyof UserRoleDto['roles']) {
    if (role === 'user') {
      if (row.roles.user) {
        // User role cannot be removed
        return;
      }
    }
    this.dialog.open(this.confirmationDialog, { data: { row, role } });
  }

  confirmRoleChange(row: UserRoleDto, role: keyof UserRoleDto['roles']) {
    // Reset all roles
    Object.keys(row.roles).forEach(key => row.roles[key as keyof UserRoleDto['roles']] = false);
    // Set the new role
    row.roles[role] = true;
    // Update the checkbox states
    this.updateCheckboxStates(row);
    // Update the user role
    this.updateUserRole(row);
  }

  updateCheckboxStates(row: UserRoleDto) {
    // Ensure at least one role is active
    const hasActiveRole = Object.values(row.roles).some(value => value);
    if (!hasActiveRole) {
      // Default to user role if no active roles
      Object.keys(row.roles).forEach(key => row.roles[key as keyof UserRoleDto['roles']] = false);
      row.roles['user'] = true; // Ensure 'user' role is active
    }
  }

  updateUserRole(row: UserRoleDto) {
    const selectedRole = this.getSelectedRole(row.roles);
    const roleId = this.getRoleId(selectedRole);

    if (roleId) {
      // Implement your logic to update the user role in the backend
      console.log('Updating user role', row.id, roleId);
      this.loadUserData(); // Refresh user data after update
    }
  }

  getSelectedRole(roles: { [key: string]: boolean }): string {
    return Object.keys(roles).find(role => roles[role]) || 'user';
  }

  getRoleId(role: string): number | null {
    // Implement your logic to map role name to role ID
    return null; // Replace with actual role ID retrieval logic
  }
}
