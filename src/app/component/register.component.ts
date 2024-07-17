import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;
  hide = true;

  constructor(
    private _formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.firstFormGroup = this._formBuilder.group({
      username: ['', Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
    this.thirdFormGroup = this._formBuilder.group({
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });
  }

  register(): void {
    if (this.thirdFormGroup.value.password !== this.thirdFormGroup.value.confirmPassword) {
      this.snackBar.open('Password and Confirm Password do not match', 'Close', {
        duration: 3000,
      });
      return;
    }

    const { username } = this.firstFormGroup.value;
    const { email } = this.secondFormGroup.value;
    const { password } = this.thirdFormGroup.value;

    this.authService.register({ username, email, password }).subscribe(response => {
      this.snackBar.open('Registration successful!', 'Close', {
        duration: 3000,
      });
      this.router.navigate(['/login']);
    }, error => {
      this.snackBar.open('Register error: ' + error.error.message, 'Close', {
        duration: 3000,
      });
    });
  }
}
