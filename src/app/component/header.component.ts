import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  logoUrl = 'images/logo/fifgroup.png'; // Set local logo URL
  isSidebarOpen = false;
  @ViewChild('logoutDialog') logoutDialog!: TemplateRef<any>; // Deklarasi ViewChild untuk logoutDialog

  constructor(
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    // URL logo sudah diatur secara lokal, tidak perlu panggilan ke backend
  }

  get username(): string {
    return this.authService.getUsername();
  }

  canAccess(page: string): boolean {
    const role = this.authService.getRole();
    const rolePermissions: { [key: string]: string[] } = {
      user: ['dashboard', 'profile'],
      superAdmin: ['dashboard', 'profile', 'employeeList', 'roleMenu'],
      staffAdmin: ['dashboard', 'profile', 'employeeList'],
      controlAdmin: ['dashboard', 'profile', 'roleMenu']
    };
    return rolePermissions[role]?.includes(page) || false;
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  navigateToEmployeeList(): void {
    this.router.navigate(['/employees']);
    this.toggleSidebar();
  }

  navigateToRoleMenu(): void {
    this.router.navigate(['/roles']);
    this.toggleSidebar();
  }

  openLogoutDialog(): void {
    this.dialog.open(this.logoutDialog);
  }

  confirmLogout(): void {
    this.authService.logout(); // Lakukan logout
    this.router.navigate(['/login']); // Navigasi ke halaman login setelah logout
    this.dialog.closeAll(); // Tutup semua dialog setelah logout
  }
}
