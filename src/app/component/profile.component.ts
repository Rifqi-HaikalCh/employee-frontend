import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { UserProfile } from '../models/user-profile.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userProfile: UserProfile | null = null;
  errorMessage: string = '';

  @ViewChild('deleteAccountDialog') deleteAccountDialog!: TemplateRef<any>;

  constructor(
    public dialog: MatDialog,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.authService.getUserProfile().subscribe({
      next: (profile: UserProfile) => {
        this.userProfile = profile;
      },
      error: (error: any) => {
        console.error('Error fetching user profile', error);
        if (error.status === 404) {
          this.errorMessage = 'User profile not found.';
        } else {
          this.errorMessage = 'Unable to load user profile. Please try again.';
        }
      }
    });
  }

  getRoleDisplayName(role: string | undefined): string {
    if (!role) return 'Unknown'; // Handle the case where role might be undefined
    const roleMap: { [key: string]: string } = {
      'USER': 'User',
      'SUPER_ADMIN': 'Super Admin',
      'STAFF_ADMIN': 'Staff Admin',
      'CONTROL_ADMIN': 'Control Admin'
    };
    return roleMap[role] || role;
  }
}



  // deleteAccount(): void {
  //   this.authService.deleteAccount().subscribe({
  //     next: () => {
  //       this.dialog.closeAll();
  //       this.authService.logout();
  //       this.router.navigate(['/login']);
  //     },
  //     error: (error: any) => {
  //       console.error('Error deleting account', error);
  //       this.errorMessage = 'An error occurred while deleting the account. Please try again.';
  //     }
  //   });
  // }