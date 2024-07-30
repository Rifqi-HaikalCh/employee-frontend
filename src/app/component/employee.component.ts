import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../services/auth.service';
import { EmployeeService } from '../services/employee.service';
import { Employee } from '../models/employee.model';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnInit {
  selectedEmployeeForm: FormGroup = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    emailId: new FormControl('', [Validators.required, Validators.email]),
    dateOfBirth: new FormControl('', [Validators.required, this.dateValidator]),
  });

  employee: any = {};
  employees: Employee[] = [];
  selectedEmployee: Employee = { id: 0, firstName: '', lastName: '', emailId: '', dateOfBirth: new Date() };
  isNew: boolean = true;
  showDeleteModal: boolean = false;
  employeeToDeleteId: number | null = null;
  dataSource: MatTableDataSource<Employee> = new MatTableDataSource();
  displayedColumns: string[] = ['id', 'firstName', 'lastName', 'emailId', 'dateOfBirth', 'actions'];
  toastMessage: string = '';
  showToast: boolean = false;
  deleteToastMessage: string = '';
  showDeleteToast: boolean = false;
  canEdit: boolean = false;
  canDelete: boolean = false;
  canAdd: boolean = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<any>;
  @ViewChild('deleteDialogTemplate') deleteDialogTemplate!: TemplateRef<any>;

  constructor(
    public dialog: MatDialog, // Changed from private to public
    private employeeService: EmployeeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
    this.checkUserAccess();
  }

  checkUserAccess(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.authService.fetchUserAccess(userId).subscribe(
        (accessMap: Map<string, boolean>) => {
          this.canEdit = accessMap.get('canEditEmployee') || false;
          this.canDelete = accessMap.get('canDeleteEmployee') || false;
          this.canAdd = accessMap.get('canAddEmployee') || false;
        },
        error => {
          console.error('Failed to fetch user access:', error);
        }
      );
    } else {
      console.error('User is not logged in');
    }
  }

  private loadEmployees() {
    this.employeeService.getAllEmployees().subscribe((employees: any[]) => {
      this.dataSource.data = employees.map(emp => ({
        ...emp,
        dateOfBirth: new Date(emp.dateOfBirth) // Ensure dateOfBirth is a Date object
      }));
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openDialog(): void {
    this.isNew = true;
    this.selectedEmployee = { id: 0, firstName: '', lastName: '', emailId: '', dateOfBirth: new Date() };
    this.selectedEmployeeForm.reset();

    this.dialog.open(this.dialogTemplate, {
      width: '500px',
      disableClose: true,
    });
  }

  onEdit(employee: Employee): void {
    this.isNew = false;
    this.selectedEmployee = { ...employee };
    this.selectedEmployeeForm.patchValue({
      ...this.selectedEmployee,
      dateOfBirth: this.formatDateForForm(this.selectedEmployee.dateOfBirth)
    });
    this.dialog.open(this.dialogTemplate, {
      width: '500px',
      disableClose: true,
    });
  }

  onSave(): void {
    if (this.selectedEmployeeForm.invalid) {
      return;
    }

    const employeeData = this.selectedEmployeeForm.value;
    employeeData.dateOfBirth = new Date(employeeData.dateOfBirth); // Convert string to Date

    if (this.isNew) {
      this.onSaveNew(employeeData);
    } else {
      this.onSaveUpdate(employeeData);
    }
  }

  onSaveNew(employeeData: Employee): void {
    const request = {
      "firstName": this.employee.firstName,
      "lastName": this.employee.lastName,
      "emailId": this.employee.emailId,
      "dateOfBirth": this.formatDateForForm(employeeData.dateOfBirth)
    };
    console.log(this.formatDateForForm(employeeData.dateOfBirth));
    this.employeeService.createEmployee(employeeData).subscribe(
      () => {
        this.loadEmployees();
        this.closeDialog();
        this.showToastMessage('Employee added successfully');
      },
      error => {
        console.error('Failed to add employee:', error);
        this.showToastMessage('Failed to add employee');
      }
    );
  }

  onSaveUpdate(employeeData: Employee): void {
    this.employeeService.updateEmployee(this.selectedEmployee.id, employeeData).subscribe(
      () => {
        this.loadEmployees();
        this.closeDialog();
        this.showToastMessage('Employee updated successfully');
      },
      error => {
        console.error('Failed to update employee:', error);
        this.showToastMessage('Failed to update employee');
      }
    );
  }

  onDelete(id: number): void {
    this.employeeToDeleteId = id;
    this.showDeleteModal = true;
    this.dialog.open(this.deleteDialogTemplate);
  }

  confirmDelete(): void {
    if (this.employeeToDeleteId !== null) {
      this.employeeService.deleteEmployee(this.employeeToDeleteId).subscribe(
        () => {
          this.loadEmployees();
          // this.cancelDelete();
          this.showDeleteToastMessage('Employee deleted successfully');
        },
        error => {
          console.error('Failed to delete employee:', error);
          this.showDeleteToastMessage('Failed to delete employee');
        }
      );
    }
  }

  // cancelDelete(): void {
  //   this.employeeToDeleteId = null;
  //   this.showDeleteModal = false;
  // }

  closeDialog(): void {
    this.dialog.closeAll();
  }

  showToastMessage(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  showDeleteToastMessage(message: string): void {
    this.deleteToastMessage = message;
    this.showDeleteToast = true;
    setTimeout(() => {
      this.showDeleteToast = false;
    }, 3000);
  }

  dateValidator(control: FormControl): { [key: string]: boolean } | null {
    // Custom date validation logic
    return null;
  }

  formatDateForForm(date: Date): string {
    return date.toISOString().split('T')[0]; // Format Date to YYYY-MM-DD
  }
}
  