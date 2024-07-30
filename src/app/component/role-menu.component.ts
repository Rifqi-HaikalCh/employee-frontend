import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { UserRoleDto } from "../services/auth.service";
import { MatDialog } from "@angular/material/dialog";
import { UserService } from "../services/user.service";


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
  detailRoleDataSource = new MatTableDataSource<any>([
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
      (data) => {
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

  onRoleSelectionChange(row: UserRoleDto, role: keyof UserRoleDto['roles']) {
    if (role === 'user' && row.roles.user) {
      // User role cannot be removed
      return;
    }

    const selectedRoles = Object.values(row.roles).filter(value => value).length;
    if (selectedRoles > 1) {
      alert('Only one role can be selected at a time!');
      return;
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
      row.roles['user'] = true; // Ensure 'user' role is active
    }
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
          console.error('Error updating user role', error);
        }
      );
    }
  }

  getSelectedRole(roles: { [key: string]: boolean }): string {
    return Object.keys(roles).find(role => roles[role]) || 'user';
  }
}
