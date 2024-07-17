import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'delete-account-dialog',
  templateUrl: 'delete-account-dialog.component.html',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteAccountDialogComponent {
  constructor(private authService: AuthService, private dialogRef: MatDialogRef<DeleteAccountDialogComponent>) {}

  confirmDelete(): void {
    this.authService.deleteAccount();
    this.dialogRef.close();
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
