import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AccessService } from '../services/access.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  private rolesAllowedForEmployeeList = ['SUPER_ADMIN', 'STAFF_ADMIN'];
  private rolesAllowedForRoleMenu = ['SUPER_ADMIN', 'CONTROL_ADMIN'];
  logoUrl = 'images/logo/fifgroup.png';
  isSidebarOpen = false;
  @ViewChild('logoutDialog') logoutDialog!: TemplateRef<any>;
  username: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private accessService: AccessService
  ) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      this.username = user.username || 'Guest'; // Default to 'Guest' if username is not available
      this.fetchUserAccess();
    } else {
      console.error('User is not authenticated');
      this.router.navigate(['/login']);
    }
  }

  fetchUserAccess(): void {
    const userId: string | null = this.authService.getUserId();
    
    if (userId) {
      console.log('Retrieved userId:', userId); // Log userId for debugging
      const numericUserId = parseInt(userId, 10);
      
      if (!isNaN(numericUserId)) {
        console.log('Numeric userId:', numericUserId); // Log numericUserId for debugging
        
        this.accessService.getUserAccess(numericUserId).subscribe(
          (accessMap) => {
            // Convert Map to Object
            const accessObj = Array.from(accessMap.entries()).reduce((acc, [key, value]) => {
              acc[key] = value;
              return acc;
            }, {} as { [key: string]: boolean });
            localStorage.setItem('userAccess', JSON.stringify(accessObj));
          },
          (error) => {
            console.error('Failed to fetch user access map', error);
          }
        );
      } else {
        console.error('Invalid numericUserId:', numericUserId);
      }
    } else {
      console.error('User ID is not available');
    }
  }

  canAccess(page: string): boolean {
    const accessMapStr = localStorage.getItem('userAccess');
    if (!accessMapStr) return false;
    const accessMap: { [key: string]: boolean } = JSON.parse(accessMapStr);
    return accessMap[page] || false;
  }
  
  openLogoutDialog(): void {
    this.dialog.open(this.logoutDialog);
  }

  confirmLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.dialog.closeAll();
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

toggleSidebar(): void {
  this.isSidebarOpen = !this.isSidebarOpen;
}

navigateToEmployeeList() {
  this.toggleSidebar();
  this.router.navigate(['/employee-list']);
}

navigateToRoleMenu() {
  this.toggleSidebar();
  this.router.navigate(['/role-menu']);
}

private isUserAuthorized(userRole: string, allowedRoles: string[]): boolean {
  return allowedRoles.includes(userRole);
}

}
