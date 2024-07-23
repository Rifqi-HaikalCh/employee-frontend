import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  hide = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  login(): void {
    this.authService.login(this.username, this.password).subscribe(response => {
      if (response.authenticated) {
        localStorage.setItem('token', response.jwttoken);
        localStorage.setItem('userAccess', JSON.stringify(response.accessMap));
        const user = {
          username: this.username,
          email: response.email,
          role: response.role,
          id: response.userId
        };
        localStorage.setItem('user', JSON.stringify(user));
        console.log(localStorage)
        this.router.navigate(['/dashboard']);
        this.snackBar.open('Login successful!', 'Close', {
          duration: 3000,
        });
      } else {
        this.snackBar.open('Login failed. Please check your credentials.', 'Close', {
          duration: 3000,
        });
      }
    }, error => {
      console.error('Login error', error);
      this.snackBar.open('Login failed. Please check your credentials.', 'Close', {
        duration: 3000,
      });
    });
  }
}
