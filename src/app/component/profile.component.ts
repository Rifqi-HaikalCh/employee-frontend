import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  username: string = '';
  email: string = '';
  role: string = '';
  @ViewChild('deleteAccountDialog') deleteAccountDialog!: TemplateRef<any>;

  constructor(
    private authService: AuthService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.authService.getUserProfile().subscribe({
      next: (user: any) => {
        this.username = user.username;
        this.email = user.email;
        this.role = user.role;
      },
      error: (error: any) => {
        console.error('Error loading user profile', error);
      }
    });
  }

  openDeleteAccountDialog(): void {
    this.dialog.open(this.deleteAccountDialog);
  }

  deleteAccount(): void {
    this.authService.deleteAccount();
    this.router.navigate(['/login']);
  }
}
