import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
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

  openDeleteAccountDialog(): void {
    this.dialog.open(this.deleteAccountDialog);
  }

  deleteAccount(): void {
    this.authService.deleteAccount().subscribe({
      next: () => {
        this.authService.logout();
        this.router.navigate(['/login']);
      },
      error: (error: any) => {
        console.error('Error deleting account', error);
        this.errorMessage = 'An error occurred while deleting the account. Please try again.';
      }
    });
  }
}
