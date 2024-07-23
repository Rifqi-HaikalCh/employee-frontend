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
  showModal: boolean = false;
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
    // Fetch user access from AuthService
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
    this.employeeService.getAllEmployees().subscribe(
      (data: Employee[]) => {
        this.employees = data;
        this.dataSource = new MatTableDataSource(this.employees);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error => {
        console.error('Failed to load employees:', error);
      }
    );
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onAdd(): void {
    if (!this.canAdd) {
      this.showToastMessage('Anda tidak memiliki akses untuk menambah data.');
      return;
    }
    this.isNew = true;
    this.selectedEmployee = new Employee();
    this.selectedEmployeeForm.reset();
    this.showModal = true;
  }

  onEdit(employee: Employee): void {
    if (!this.canEdit) {
      this.showToastMessage('Anda tidak memiliki akses untuk mengedit data.');
      return;
    }
    this.isNew = false;
    this.selectedEmployee = { ...employee };
    this.selectedEmployeeForm.patchValue(this.selectedEmployee);
    this.showModal = true;
  }

  onSave(): void {
    if (this.selectedEmployeeForm.invalid) {
      return;
    }

    if (this.isNew) {
      this.onSaveNew();
    } else {
      this.onSaveUpdate();
    }
  }

  onSaveNew(): void {
    this.employeeService.createEmployee(this.selectedEmployee).subscribe(
      () => {
        this.loadEmployees();
        this.closeModal();
        this.showToastMessage('Data telah ditambah');
      },
      error => {
        console.error('Failed to add employee:', error);
        this.showToastMessage('Gagal menambah data');
      }
    );
  }

  onSaveUpdate(): void {
    this.employeeService.updateEmployee(this.selectedEmployee.id!, this.selectedEmployee).subscribe(
      () => {
        this.loadEmployees();
        this.closeModal();
        this.showToastMessage('Data telah diupdate');
      },
      error => {
        console.error('Failed to update employee:', error);
        this.showToastMessage('Gagal memperbarui data');
      }
    );
  }

  onDelete(id: number): void {
    if (!this.canDelete) {
      this.showToastMessage('Anda tidak memiliki akses untuk menghapus data.');
      return;
    }
    this.employeeToDeleteId = id;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (this.employeeToDeleteId !== null) {
      this.employeeService.deleteEmployee(this.employeeToDeleteId).subscribe(
        () => {
          this.loadEmployees();
          this.cancelDelete();
          this.showDeleteToastMessage('Data telah dihapus');
        },
        error => {
          console.error('Failed to delete employee:', error);
          this.showDeleteToastMessage('Gagal menghapus data');
        }
      );
    }
  }

  cancelDelete(): void {
    this.employeeToDeleteId = null;
    this.showDeleteModal = false;
  }

  closeModal(): void {
    this.showModal = false;
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

  openDialog(): void {
    this.dialog.open(this.dialogTemplate, {
      width: '700px'
    });
  }

  dateValidator(control: FormControl): { [key: string]: boolean } | null {
    const value = control.value;
    if (!value) {
      return null;
    }
    const today = new Date();
    const birthDate = new Date(value);
    const minDate = new Date(today.getFullYear() - 60, today.getMonth(), today.getDate());
    const maxDate = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate());
    if (birthDate < minDate || birthDate > maxDate) {
      return { 'dateInvalid': true };
    }
    return null;
  }
}
