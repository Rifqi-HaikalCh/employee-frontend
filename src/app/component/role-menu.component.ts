import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { MatDialog } from "@angular/material/dialog";
import { UserService } from "../services/user.service";

export interface UserRoleDto {
  id: number;
  username: string;
  roles: {
    user: boolean;
    superAdmin: boolean;
    staffAdmin: boolean;
    controlAdmin: boolean;
  };
}

export interface RoleFeature {
  role: string;
  features: { name: string; enabled: boolean }[];
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

  detailRoleDisplayedColumns: string[] = ['feature'];
  detailRoleDataSource: MatTableDataSource<RoleFeature> = new MatTableDataSource<RoleFeature>([
    { role: 'Super Admin', features: [{ name: 'employeeList', enabled: true }, { name: 'roleMenuFunction', enabled: true }] },
    { role: 'Staff Admin', features: [{ name: 'employeeList', enabled: true }, { name: 'roleMenuFunction', enabled: false }] },
    { role: 'Control Admin', features: [{ name: 'employeeList', enabled: false }, { name: 'roleMenuFunction', enabled: true }] },
    { role: 'User', features: [{ name: 'employeeList', enabled: false }, { name: 'roleMenuFunction', enabled: false }] }
  ]);

  featureDisplayedColumns: string[] = ['feature'];
  featureDataSource = new MatTableDataSource<{ name: string; enabled: boolean }>([]);
  selectedRole: RoleFeature | null = null;

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

  onRoleChange(role: RoleFeature) {
    this.selectedRole = role;
    this.featureDataSource.data = role.features;
  }

  onRoleSelectionChange(row: UserRoleDto, role: keyof UserRoleDto['roles']) {
    // Ensure only one role is selected at a time
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
          console.error('Error updating user role', error);
        }
      );
    }
  }

  getSelectedRole(roles: { [key: string]: boolean }): string {
    return Object.keys(roles).find(role => roles[role]) || 'user';
  }
}
