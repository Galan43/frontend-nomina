import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmpleadoService } from '../../services/empleado.service';
import { Empleado, Puesto } from '../../models/empleado.model';
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  totalEmpleados = 0;
  empleadosActivos = 0;
  totalPuestos = 0;
  totalNomina = 0;
  empleadosPorPuesto: any[] = [];
  empleadosRecientes: Empleado[] = [];

  constructor(private empleadoService: EmpleadoService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  // Función para convertir Timestamp de Firebase a Date
  toDate(timestamp: any): Date {
    if (timestamp && timestamp.toDate) {
      return timestamp.toDate();
    }
    if (timestamp && timestamp.seconds) {
      return new Date(timestamp.seconds * 1000);
    }
    return new Date(timestamp);
  }

  private loadDashboardData(): void {
    // Cargar empleados
    this.empleadoService.getEmpleados().subscribe({
      next: (empleados) => {
        this.totalEmpleados = empleados.length;
        this.empleadosActivos = empleados.filter(e => e.activo).length;
        this.empleadosRecientes = empleados
          .sort((a, b) => this.toDate(b.creadoEn).getTime() - this.toDate(a.creadoEn).getTime())
          .slice(0, 5);
        
        this.calculateEmpleadosPorPuesto(empleados);
      },
      error: (err) => console.error('Error loading empleados:', err)
    });

    // Cargar puestos
    this.empleadoService.getPuestos().subscribe({
      next: (puestos) => {
        this.totalPuestos = puestos.length;
        this.calculateTotalNomina(puestos);
      },
      error: (err) => console.error('Error loading puestos:', err)
    });
  }

  private calculateEmpleadosPorPuesto(empleados: Empleado[]): void {
    const puestoCount: { [key: string]: number } = {};
    
    empleados.forEach(empleado => {
      if (empleado.activo && empleado.puesto) {
        const puestoNombre = empleado.puesto;
        puestoCount[puestoNombre] = (puestoCount[puestoNombre] || 0) + 1;
      }
    });

    this.empleadosPorPuesto = Object.entries(puestoCount)
      .map(([puesto, cantidad]) => ({ puesto, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }

  private calculateTotalNomina(puestos: Puesto[]): void {
    this.totalNomina = puestos.reduce((total, puesto) => {
      return total + (puesto.sueldoQuincenal || 0);
    }, 0) * this.empleadosActivos;
  }
}
