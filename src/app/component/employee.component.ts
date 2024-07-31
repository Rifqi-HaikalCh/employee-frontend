import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
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
  employeeToDelete: any;
  showDeleteModal = false;
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
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  checkUserAccess(): void {
    if (this.authService.isAuthenticated()) {
      this.authService.fetchUserAccess().subscribe(
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
    this.employeeService.createEmployee(employeeData).subscribe(
      () => {
        this.loadEmployees();
        this.closeDialog();
        this.showToastMessage('Employee added successfully');
      },
      error => {
        if (error.status === 400 && error.error.message === 'Email address already exists') {
          this.showToastMessage('Email address already exists');
        } else {
          console.error('Failed to add employee:', error);
          this.showToastMessage('Failed to add employee, check your email it must be unique');
        }
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
        if (error.status === 400 && error.error.message === 'Email address already exists') {
          this.showToastMessage('Email address already exists');
        } else {
          console.error('Failed to update employee:', error);
          this.showToastMessage('Failed to update employee');
        }
      }
    );
  }

  onDelete(employee: any): void {
    this.employeeToDelete = employee;
    const dialogRef = this.dialog.open(this.deleteDialogTemplate, {
      data: { employee: employee }
    });
  }
  
  confirmDelete(dialogRef: MatDialogRef<any>): void {
    if (this.employeeToDelete) {
      this.employeeService.deleteEmployee(this.employeeToDelete.id).subscribe(
        (response: string) => {
          this.loadEmployees();
          this.showDeleteToastMessage(response || 'Employee deleted successfully');
          dialogRef.close();
        },
        error => {
          console.error('Failed to delete employee:', error);
          this.showDeleteToastMessage('Failed to delete employee');
        }
      );
    }
  }
  
  close(dialogRef: MatDialogRef<any>): void {
    dialogRef.close();
  }

  closeDialog(): void {
    this.dialog.closeAll();
  }

  showToastMessage(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
  }

  showDeleteToastMessage(message: string): void {
    this.deleteToastMessage = message;
    this.showDeleteToast = true;
    setTimeout(() => this.showDeleteToast = false, 3000);
  }

  private formatDateForForm(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  private dateValidator(control: FormControl): { [key: string]: boolean } | null {
    const dateValue = new Date(control.value);
    const currentDate = new Date();
    if (dateValue > currentDate) {
      return { 'futureDate': true };
    }
    return null;
  }
}
