import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const expectedRoles = route.data['roles']; // Mengakses 'roles' menggunakan notasi indeks
    const userRole = localStorage.getItem('userRole'); // Asumsikan role disimpan di localStorage

    if (expectedRoles.includes(userRole)) {
      return true;
    } else {
      this.router.navigate(['/dashboard']);
      return false;
    }
  }
}
