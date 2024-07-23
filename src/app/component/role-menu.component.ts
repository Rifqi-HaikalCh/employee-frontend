import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { RoleService, UserElement, UserRole } from '../services/role.service';
import { AuthService } from '../services/auth.service';

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

  displayedColumns: string[] = ['id', 'username', 'user', 'superAdmin', 'staffAdmin', 'controlAdmin'];
  dataSource = new MatTableDataSource<UserElement>([]);
  selection = new SelectionModel<UserElement>(true, []);

  detailRoleDisplayedColumns: string[] = ['role', 'features'];
  detailRoleDataSource = new MatTableDataSource<RoleDetail>([
    { role: 'Super Admin', features: ['employeeList', 'roleMenuFunction'] },
    { role: 'Staff Admin', features: ['employeeList'] },
    { role: 'Control Admin', features: ['roleMenuFunction'] },
    { role: 'User', features: [] }
  ]);

  canEditRoles: boolean = false;

  constructor(
    private dialog: MatDialog,
    private roleService: RoleService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadUserData();
    this.checkUserAccess();
  }

  checkUserAccess(): void {
    this.authService.fetchUserAccess().subscribe(accessMap => {
      this.canEditRoles = accessMap.get('canEditRoles') || false;
    });
  }

  loadUserData() {
    this.roleService.getAllUsers().subscribe(
      (data: UserElement[]) => {
        this.dataSource.data = data;
      },
      (error) => {
        console.error('Failed to load user data', error);
      }
    );
  }

  onRoleSelectionChange(row: UserElement, role: keyof UserRole) {
    if (!this.canEditRoles) {
      console.error('You are not authorized to change roles.');
      return;
    }
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
    // Reset all roles
    Object.keys(row.roles).forEach(key => row.roles[key as keyof UserRole] = false);
    // Set the new role
    row.roles[role] = true;
    // Update the checkbox states
    this.updateCheckboxStates(row);
    // Update the user role
    this.updateUserRole(row);
  }

  updateCheckboxStates(row: UserElement) {
    // Ensure at least one role is active
    const hasActiveRole = Object.values(row.roles).some(value => value);
    if (!hasActiveRole) {
      // Default to user role if no active roles
      Object.keys(row.roles).forEach(key => row.roles[key as keyof UserRole] = false);
      row.roles['user'] = true; // Ensure 'user' role is active
    }
  }

  isRoleSelected(row: UserElement, role: keyof UserRole): boolean {
    return row.roles[role] || Object.values(row.roles).some(value => value);
  }

  openDetailRoleDialog() {
    this.dialog.open(this.detailRoleDialog);
  }

  updateUserRole(row: UserElement) {
    const selectedRole = this.getSelectedRole(row.roles);
    const roleId = this.getRoleId(selectedRole);
    if (roleId !== null) {
      this.roleService.updateUserRole(row.id, roleId).subscribe(
        () => {
          console.log('User role updated successfully');
        },
        (error) => {
          console.error('Failed to update user role', error);
        }
      );
    }
  }

  getSelectedRole(roles: UserRole): string {
    if (roles.superAdmin) return 'superAdmin';
    if (roles.staffAdmin) return 'staffAdmin';
    if (roles.controlAdmin) return 'controlAdmin';
    return 'user'; // Default role if none are set
  }

  getRoleId(role: string): number | null {
    switch (role) {
      case 'superAdmin':
        return 1;
      case 'staffAdmin':
        return 2;
      case 'controlAdmin':
        return 3;
      case 'user':
        return 4;
      default:
        return null;
    }
  }

  isSuperAdmin(): boolean {
    return this.authService.getUserRole() === 'superAdmin';
  }

  isStaffAdmin(): boolean {
    return this.authService.getUserRole() === 'staffAdmin';
  }

  isControlAdmin(): boolean {
    return this.authService.getUserRole() === 'controlAdmin';
  }

  isSuperAdminOrControlAdmin(): boolean {
    const role = this.authService.getUserRole();
    return role === 'superAdmin' || role === 'controlAdmin';
  }

  isSelf(row: UserElement): boolean {
    const currentUserId = this.authService.getUserId();
    return currentUserId === row.id.toString();
  }
}
