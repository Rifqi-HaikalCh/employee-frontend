import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const roles = route.data['roles'] as Array<string>;
    const userRole = this.authService.getUserRole(); // Use getUserRole() to get the user's role

    // Handle case where userRole might be null
    if (userRole && roles.includes(userRole)) {
      return true;
    }

    // Redirect to a default page if access is denied
    this.router.navigate(['/']);
    return false;
  }
}
