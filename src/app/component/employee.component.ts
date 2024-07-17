import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Employee } from '../models/employee.model';
import { EmployeeService } from '../services/employee.service';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';

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

  email = new FormControl('', [Validators.required, Validators.email]);
  dateOfBirth = new FormControl('', [Validators.required, this.dateValidator]);
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

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<any>;

  constructor(private employeeService: EmployeeService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.employeeService.getAllEmployees().subscribe((data: Employee[]) => {
      this.employees = data;
      this.dataSource = new MatTableDataSource(this.employees);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onAdd(): void {
    this.isNew = true;
    this.selectedEmployee = new Employee();
    this.showModal = true;
  }

  onEdit(employee: Employee): void {
    this.isNew = false;
    this.selectedEmployee = { ...employee };
    this.showModal = true;
  }

  onSave(): void {
    if (this.selectedEmployeeForm.invalid) {
      // Form is invalid, prevent submission
      return;
    }

    if (this.isNew) {
      this.onSaveNew();
    } else {
      this.onSaveUpdate();
    }
  }

  onSaveNew(): void {
    this.employeeService.saveEmployee(this.selectedEmployee).subscribe(() => {
      this.loadEmployees();
      this.closeModal();
      this.showToastMessage('Data telah ditambah');
    });
  }

  onSaveUpdate(): void {
    this.employeeService.updateEmployee(this.selectedEmployee.id!, this.selectedEmployee).subscribe(() => {
      this.loadEmployees();
      this.closeModal();
      this.showToastMessage('Data telah diupdate');
    });
  }

  onDelete(id: number): void {
    this.employeeToDeleteId = id;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (this.employeeToDeleteId !== null) {
      this.employeeService.deleteEmployee(this.employeeToDeleteId).subscribe(() => {
        this.loadEmployees();
        this.cancelDelete();
        this.showDeleteToastMessage('Data telah dihapus');
      });
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
    const dialogRef = this.dialog.open(this.dialogTemplate, {
      width: '700px' // Set the desired width here
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
