import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmpleadoService } from '../../services/empleado.service';
import { Empleado, ConceptoNomina, EmpleadoConcepto, NominaQuincenal } from '../../models/empleado.model';

@Component({
  selector: 'app-nomina',
  imports: [CommonModule, FormsModule],
  templateUrl: './nomina.component.html',
  styleUrl: './nomina.component.css'
})
export class NominaComponent implements OnInit {
  empleados: Empleado[] = [];
  conceptos: ConceptoNomina[] = [];
  selectedEmpleado: Empleado | null = null;
  empleadoConceptos: EmpleadoConcepto[] = [];
  showModal = false;
  loading = false;
  
  // Conceptos predefinidos
  conceptosPredefinidos = [
    { nombre: 'Sueldo Base', tipo: 'PERCEPCION', importe: 0 },
    { nombre: 'Gratificación', tipo: 'PERCEPCION', importe: 0 },
    { nombre: 'Despensa', tipo: 'PERCEPCION', importe: 0 },
    { nombre: 'ISR', tipo: 'DEDUCCION', importe: 0 }
  ];

  constructor(private empleadoService: EmpleadoService) {}

  ngOnInit(): void {
    this.loadEmpleados();
    this.loadConceptos();
  }

  loadEmpleados(): void {
    this.empleadoService.getEmpleados().subscribe({
      next: (empleados) => {
        this.empleados = empleados.filter(e => e.activo);
      },
      error: (err) => console.error('Error loading empleados:', err)
    });
  }

  loadConceptos(): void {
    this.empleadoService.getConceptos().subscribe({
      next: (conceptos) => {
        this.conceptos = conceptos;
      },
      error: (err) => console.error('Error loading conceptos:', err)
    });
  }

  selectEmpleado(empleado: Empleado): void {
    this.selectedEmpleado = empleado;
    this.loadEmpleadoConceptos(empleado.id);
  }

  loadEmpleadoConceptos(empleadoId: string): void {
    this.loading = true;
    
    // Intentar cargar nómina existente
    this.empleadoService.getNominaEmpleado(empleadoId).subscribe({
      next: (conceptos) => {
        if (conceptos.length > 0) {
          // Usar datos guardados
          this.empleadoConceptos = conceptos;
        } else {
          // Inicializar con conceptos predefinidos
          this.empleadoConceptos = this.conceptosPredefinidos.map((concepto, index) => ({
            id: `temp-${index}`,
            empleadoId: empleadoId,
            conceptoId: `concepto-${index}`,
            nombre: concepto.nombre,
            tipo: concepto.tipo as 'PERCEPCION' | 'DEDUCCION',
            importe: concepto.importe,
            activo: true,
            createdAt: new Date()
          }));
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading nomina:', err);
        // En caso de error, usar conceptos predefinidos
        this.empleadoConceptos = this.conceptosPredefinidos.map((concepto, index) => ({
          id: `temp-${index}`,
          empleadoId: empleadoId,
          conceptoId: `concepto-${index}`,
          nombre: concepto.nombre,
          tipo: concepto.tipo as 'PERCEPCION' | 'DEDUCCION',
          importe: concepto.importe,
          activo: true,
          createdAt: new Date()
        }));
        this.loading = false;
      }
    });
  }

  updateConcepto(index: number, importe: number): void {
    this.empleadoConceptos[index].importe = importe;
  }

  calcularTotalPercepciones(): number {
    return this.empleadoConceptos
      .filter(c => c.tipo === 'PERCEPCION')
      .reduce((total, c) => total + c.importe, 0);
  }

  calcularTotalDeducciones(): number {
    return this.empleadoConceptos
      .filter(c => c.tipo === 'DEDUCCION')
      .reduce((total, c) => total + c.importe, 0);
  }

  calcularSueldoNeto(): number {
    return this.calcularTotalPercepciones() - this.calcularTotalDeducciones();
  }

  guardarNomina(): void {
    if (!this.selectedEmpleado) return;

    this.loading = true;
    
    const nomina: Partial<NominaQuincenal> = {
      empleadoId: this.selectedEmpleado.id,
      periodo: new Date().toISOString().split('T')[0],
      conceptos: this.empleadoConceptos,
      totalPercepciones: this.calcularTotalPercepciones(),
      totalDeducciones: this.calcularTotalDeducciones(),
      sueldoNeto: this.calcularSueldoNeto()
    };

    this.empleadoService.saveNominaEmpleado(nomina).subscribe({
      next: () => {
        console.log('Nómina guardada exitosamente');
        alert('Nómina guardada correctamente');
        this.loading = false;
      },
      error: (err) => {
        console.error('Error guardando nómina:', err);
        alert('Error al guardar nómina: ' + (err.message || 'Error desconocido'));
        this.loading = false;
      }
    });
  }
}