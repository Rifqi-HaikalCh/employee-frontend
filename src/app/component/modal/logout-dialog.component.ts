import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'logout-dialog',
  templateUrl: 'logout-dialog.component.html',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogoutDialogComponent {
  constructor(private authService: AuthService, private dialogRef: MatDialogRef<LogoutDialogComponent>) {}

  confirmLogout(): void {
    this.authService.logout();
    this.dialogRef.close();
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
