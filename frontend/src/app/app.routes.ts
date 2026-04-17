import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { AdminPanelComponent } from './pages/admin-panel/admin-panel.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AddStudentComponent } from './pages/add-student/add-student.component';
import { StudentDetailsComponent } from './pages/student-details/student-details.component';
import { EditStudentComponent } from './pages/edit-student/edit-student.component';
import { CollectFeeComponent } from './pages/collect-fee/collect-fee.component';
import { PaymentHistoryComponent } from './pages/payment-history/payment-history.component';
import { AnalyticsComponent } from './pages/analytics/analytics.component';
import { ImportStudentsComponent } from './pages/import-students/import-students.component';
import { AuthGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'add-student', component: AddStudentComponent, canActivate: [AuthGuard] },
  { path: 'import-students', component: ImportStudentsComponent, canActivate: [AuthGuard] },
  { path: 'student/:id', component: StudentDetailsComponent, canActivate: [AuthGuard] },
  { path: 'edit-student/:id', component: EditStudentComponent, canActivate: [AuthGuard] },
  { path: 'collect-fee/:id', component: CollectFeeComponent, canActivate: [AuthGuard] },
  { path: 'payments/:id', component: PaymentHistoryComponent, canActivate: [AuthGuard] },
  { path: 'admin', component: AdminPanelComponent, canActivate: [AuthGuard] },
  { path: 'analytics', component: AnalyticsComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }
];