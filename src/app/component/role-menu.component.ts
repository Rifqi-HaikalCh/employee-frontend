import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { UserService } from '../services/user.service';
import { Role } from '../models/role.enum'; // Ensure the path is correct

export interface UserRoleDto {
  id: number;
  username: string;
  roles: {
    [Role.USER]: boolean;
    [Role.SUPER_ADMIN]: boolean;
    [Role.STAFF_ADMIN]: boolean;
    [Role.CONTROL_ADMIN]: boolean;
  };
}

export interface Feature {
  name: string;
  enabled: boolean;
}

@Component({
  selector: 'app-role-menu',
  templateUrl: './role-menu.component.html',
  styleUrls: ['./role-menu.component.css']
})
export class RoleMenuComponent implements OnInit {
  @ViewChild('confirmationDialog', { static: true }) confirmationDialog!: TemplateRef<any>;
  @ViewChild('detailRoleDialog', { static: true }) detailRoleDialog!: TemplateRef<any>;

  displayedColumns: string[] = ['no', 'username', 'user', 'superAdmin', 'staffAdmin', 'controlAdmin'];
  dataSource = new MatTableDataSource<UserRoleDto>([]);

  featureDisplayedColumns: string[] = ['feature'];

  superAdminFeatures = new MatTableDataSource<Feature>([
    { name: 'Employee List', enabled: true },
    { name: 'Role Menu Function', enabled: true }
  ]);

  staffAdminFeatures = new MatTableDataSource<Feature>([
    { name: 'Employee List', enabled: true },
    { name: 'Role Menu Function', enabled: false }
  ]);

  controlAdminFeatures = new MatTableDataSource<Feature>([
    { name: 'Employee List', enabled: false },
    { name: 'Role Menu Function', enabled: true }
  ]);

  userFeatures = new MatTableDataSource<Feature>([
    { name: 'Employee List', enabled: false },
    { name: 'Role Menu Function', enabled: false }
  ]);

  Role = Role; // Expose the Role enum to the template

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
        console.log(data);
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

  onRoleSelectionChange(row: UserRoleDto, role: Role) {
    this.dialog.open(this.confirmationDialog, { data: { row, role } });
  }

  confirmRoleChange(row: UserRoleDto, role: Role) {
    // Reset all roles
    Object.keys(row.roles).forEach(key => row.roles[key as Role] = false);
    // Set the new role
    row.roles[role] = true;
    
    // Update the user role
    this.updateUserRole(row);
  }

  updateUserRole(row: UserRoleDto) {
    const selectedRole = this.getSelectedRole(row.roles);
    if (selectedRole) {
      this.userService.updateUserRole(row.id, selectedRole).subscribe(
        (response: any) => {
          console.log('User role updated successfully', response);
          this.loadUserData(); // Refresh user data after update
        },
        (error: any) => {
          const errorMessage = error.error.message || error.error || 'Error updating user role';
          console.error(errorMessage, error);
        }
      );
    }
  }

  getSelectedRole(roles: { [key: string]: boolean }): string {
    const selectedRole = Object.keys(roles).find(role => roles[role]);
    return selectedRole ? selectedRole : Role.USER;
  }
}
