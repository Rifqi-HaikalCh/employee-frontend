import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './component/login.component';
import { RegisterComponent } from './component/register.component';
import { DashboardComponent } from './component/dashboard.component';
import { ProfileComponent } from './component/profile.component';
import { EmployeeComponent } from './component/employee.component';
import { HeaderComponent } from './component/header.component';
import { AuthService } from './services/auth.service';
import { AuthGuard } from './guards/auth.guard';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatCommonModule } from '@angular/material/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { MdbCarouselModule } from 'mdb-angular-ui-kit/carousel';
import { RoleMenuComponent } from './component/role-menu.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CarouselComponent } from './component/carousel.component';
import { MatMenuModule } from '@angular/material/menu';
import { GalleriaModule } from 'primeng/galleria';
import { ButtonModule } from 'primeng/button';
import { PhotoService } from './services/photo.service';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    ProfileComponent,
    EmployeeComponent,
    HeaderComponent,
    CarouselComponent,
    RoleMenuComponent
  ],
  imports: [
    MatFormFieldModule,
    MatCommonModule,
    HttpClientModule,
    MatCheckboxModule,
    MatInputModule,
    MatSelectModule,
    MatMenuModule,
    MatTableModule,
    MdbCarouselModule,
    GalleriaModule,
    ButtonModule,
    CommonModule, 
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatStepperModule,
    MatSnackBarModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [PhotoService, AuthService, AuthGuard, provideAnimationsAsync()],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] 
})
export class AppModule { }
