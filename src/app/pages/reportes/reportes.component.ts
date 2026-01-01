import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmpleadoService } from '../../services/empleado.service';
import { Empleado } from '../../models/empleado.model';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-reportes',
  imports: [CommonModule],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css'
})
export class ReportesComponent implements OnInit {
  empleadosReporte: Empleado[] = [];
  empleadosActivos = 0;
  totalNomina = 0;
  loading = false;

  constructor(private empleadoService: EmpleadoService) {}

  ngOnInit(): void {
    this.loadReporte();
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

  loadReporte(): void {
    this.loading = true;
    console.log('Cargando reporte de nómina...');
    
    this.empleadoService.getEmpleados().subscribe({
      next: (empleados) => {
        this.empleadosReporte = empleados.filter(e => e.activo && !e.eliminadoEn);
        this.empleadosActivos = this.empleadosReporte.length;
        console.log('Empleados activos encontrados:', this.empleadosActivos);
        this.calculateTotalNomina();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading empleados:', err);
        this.loading = false;
      }
    });
  }

  private calculateTotalNomina(): void {
    // Calcular nómina total basándose en las nóminas guardadas
    let totalCalculado = 0;
    let empleadosProcesados = 0;
    
    this.empleadosReporte.forEach(empleado => {
      this.empleadoService.getNominaEmpleado(empleado.id).subscribe({
        next: (conceptos) => {
          if (conceptos.length > 0) {
            // Calcular sueldo neto de este empleado
            const percepciones = conceptos
              .filter(c => c.tipo === 'PERCEPCION')
              .reduce((total, c) => total + c.importe, 0);
            const deducciones = conceptos
              .filter(c => c.tipo === 'DEDUCCION')
              .reduce((total, c) => total + c.importe, 0);
            const sueldoNeto = percepciones - deducciones;
            totalCalculado += sueldoNeto;
          }
          
          empleadosProcesados++;
          if (empleadosProcesados === this.empleadosReporte.length) {
            this.totalNomina = totalCalculado;
          }
        },
        error: (err) => {
          console.error('Error calculando nómina para empleado:', empleado.id, err);
          empleadosProcesados++;
          if (empleadosProcesados === this.empleadosReporte.length) {
            this.totalNomina = totalCalculado;
          }
        }
      });
    });
    
    // Si no hay empleados, establecer total en 0
    if (this.empleadosReporte.length === 0) {
      this.totalNomina = 0;
    }
  }

  exportToExcel(): void {
    const data = this.empleadosReporte.map(empleado => ({
      'ID': empleado.id,
      'Nombre': empleado.nombre,
      'Puesto': empleado.puesto || 'Sin asignar',
      'Fecha Creación': this.toDate(empleado.creadoEn).toLocaleDateString(),
      'Región': empleado.region
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Empleados Activos');
    
    const fileName = `reporte_empleados_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }

  exportToPDF(): void {
    const printContent = this.generatePrintableContent();
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  }

  private generatePrintableContent(): string {
    const currentDate = new Date().toLocaleDateString();
    
    let content = `
      <html>
        <head>
          <title>Reporte de Empleados Activos</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .header { text-align: center; margin-bottom: 20px; }
            .summary { margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Sistema de Nómina</h1>
            <h2>Reporte de Empleados Activos</h2>
            <p>Fecha: ${currentDate}</p>
          </div>
          
          <div class="summary">
            <p><strong>Total de Empleados Activos:</strong> ${this.empleadosActivos}</p>
            <p><strong>Nómina Total Quincenal:</strong> $${this.totalNomina.toFixed(2)}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Puesto</th>
                <th>Fecha Creación</th>
                <th>Región</th>
              </tr>
            </thead>
            <tbody>
    `;

    this.empleadosReporte.forEach(empleado => {
      content += `
        <tr>
          <td>${empleado.nombre}</td>
          <td>${empleado.puesto || 'Sin asignar'}</td>
          <td>${this.toDate(empleado.creadoEn).toLocaleDateString()}</td>
          <td>${empleado.region}</td>
        </tr>
      `;
    });

    content += `
            </tbody>
          </table>
        </body>
      </html>
    `;

    return content;
  }
}
