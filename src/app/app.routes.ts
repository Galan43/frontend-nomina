import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './pages/auth/login/login.component';
import { SignupComponent } from './pages/auth/signup/signup.component';
import { LayoutComponent } from './shared/layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { EmpleadosComponent } from './pages/empleados/empleados.component';
import { PuestosComponent } from './pages/puestos/puestos.component';
import { ConceptosComponent } from './pages/conceptos/conceptos.component';
import { NominaComponent } from './pages/nomina/nomina.component';
import { ReportesComponent } from './pages/reportes/reportes.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { GraficaComponent } from './pages/grafica/grafica.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'empleados', component: EmpleadosComponent },
      { path: 'puestos', component: PuestosComponent },
      { path: 'conceptos', component: ConceptosComponent },
      { path: 'nomina', component: NominaComponent },
      { path: 'reportes', component: ReportesComponent },
      { path: 'graficas', component: GraficaComponent }
    ]
  }
];
