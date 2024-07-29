import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Employee } from '../models/employee.model';
import { EmployeeService } from '../services/employee.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../services/auth.service';


@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnInit {
  selectedEmployeeForm: FormGroup = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    dateOfBirth: new FormControl('', [Validators.required, this.dateValidator]),
  });

  employee: any = {};
  employees: Employee[] = [];
  selectedEmployee: Employee = new Employee();
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
    private employeeService: EmployeeService,
    private dialog: MatDialog,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
    this.checkUserAccess();
  }

  checkUserAccess(): void {
    this.authService.fetchUserAccess().subscribe(
      accessMap => {
        this.canEdit = accessMap.get('canEditEmployee') || false;
        this.canDelete = accessMap.get('canDeleteEmployee') || false;
        this.canAdd = accessMap.get('canAddEmployee') || false;
      },
      error => {
        console.error('Failed to fetch user access:', error);
      }
    );
  }

  loadEmployees(): void {
    this.employeeService.getAllEmployees().subscribe({
      next: (data: Employee[]) => {
        this.employees = data;
        console.log('Employees:', data); // Log the actual data here
      },
      error: (error: any) => {
        console.error('Error fetching employees', error);
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openDialog(): void {
    this.isNew = true; // Assuming you're adding a new employee
    this.selectedEmployee = new Employee(); // Reset selected employee
    this.selectedEmployeeForm.reset(); // Reset form

    this.dialog.open(this.dialogTemplate, {
      width: '500px', // Adjust width as needed
      disableClose: true, // Prevent closing by clicking outside
    });
  }

  onEdit(employee: Employee): void {
    this.isNew = false;
    this.selectedEmployee = { ...employee };
    this.selectedEmployeeForm.patchValue(this.selectedEmployee);
    this.dialog.open(this.dialogTemplate, {
      width: '500px', // Adjust width as needed
      disableClose: true, // Prevent closing by clicking outside
    });
  }

  onSave(): void {
    if (this.selectedEmployeeForm.invalid) {
      return;
    }

    const employeeData = this.selectedEmployeeForm.value;
    if (this.isNew) {
      this.onSaveNew(employeeData);
    } else {
      this.onSaveUpdate(employeeData);
    }
  }

  onSaveNew(employeeData: any): void {
    this.employeeService.createEmployee(employeeData).subscribe(
      () => {
        this.loadEmployees();
        this.closeDialog();
        this.showToastMessage('Data has been added');
      },
      error => {
        console.error('Failed to add employee:', error);
        this.showToastMessage('Failed to add data');
      }
    );
  }

  onSaveUpdate(employeeData: any): void {
    this.employeeService.updateEmployee(this.selectedEmployee.id!, employeeData).subscribe(
      () => {
        this.loadEmployees();
        this.closeDialog();
        this.showToastMessage('Data has been updated');
      },
      error => {
        console.error('Failed to update employee:', error);
        this.showToastMessage('Failed to update data');
      }
    );
  }

  onDelete(id: number): void {
    this.employeeToDeleteId = id;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (this.employeeToDeleteId !== null) {
      this.employeeService.deleteEmployee(this.employeeToDeleteId).subscribe(
        () => {
          this.loadEmployees();
          this.cancelDelete();
          this.showDeleteToastMessage('Data has been deleted');
        },
        error => {
          console.error('Failed to delete employee:', error);
          this.showDeleteToastMessage('Failed to delete data');
        }
      );
    }
  }

  cancelDelete(): void {
    this.employeeToDeleteId = null;
    this.showDeleteModal = false;
  }

  closeDialog(): void {
    this.dialog.closeAll(); // Closes all open dialogs
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
}
