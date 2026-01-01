import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmpleadoService } from '../../services/empleado.service';
import { PermissionsService, Permission } from '../../services/permissions.service';
import { Empleado, Puesto } from '../../models/empleado.model';

@Component({
  selector: 'app-empleados',
  imports: [CommonModule, FormsModule],
  templateUrl: './empleados.component.html',
  styleUrl: './empleados.component.css'
})
export class EmpleadosComponent implements OnInit {
  empleados: Empleado[] = [];
  filteredEmpleados: Empleado[] = [];
  puestos: Puesto[] = [];
  showModal = false;
  isEditing = false;
  loading = false;
  searchTerm = '';
  filterStatus = '';
  showDeleted = false;

  currentEmpleado: Partial<Empleado> = {};

  // Permisos
  Permission = Permission;

  constructor(
    private empleadoService: EmpleadoService,
    public permissionsService: PermissionsService
  ) {}

  ngOnInit(): void {
    this.loadEmpleados();
    this.loadPuestos();
  }

  // Función para convertir Timestamp de Firebase a Date
  toDate(timestamp: any): Date {
    if (!timestamp) {
      return new Date(); // Si no hay timestamp, usar fecha actual
    }
    if (timestamp && timestamp.toDate) {
      return timestamp.toDate();
    }
    if (timestamp && timestamp.seconds) {
      return new Date(timestamp.seconds * 1000);
    }
    return new Date(timestamp);
  }

  loadEmpleados(): void {
    console.log('Cargando empleados...');
    this.empleadoService.getEmpleados().subscribe({
      next: (empleados) => {
        console.log('Empleados cargados desde Firebase:', empleados);
        // Asegurar que activo sea boolean
        this.empleados = empleados.map(emp => ({
          ...emp,
          activo: Boolean(emp.activo)
        }));
        console.log('Empleados procesados:', this.empleados);
        this.filteredEmpleados = this.empleados;
      },
      error: (err) => {
        console.error('Error loading empleados:', err);
        alert('Error al cargar empleados: ' + (err.message || 'Error desconocido'));
      }
    });
  }

  loadPuestos(): void {
    this.empleadoService.getPuestos().subscribe({
      next: (puestos) => {
        this.puestos = puestos;
      },
      error: (err) => console.error('Error loading puestos:', err)
    });
  }

  filterEmpleados(): void {
    this.filteredEmpleados = this.empleados.filter(empleado => {
      const matchesSearch = !this.searchTerm || 
        empleado.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        empleado.region.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.filterStatus || 
        empleado.activo.toString() === this.filterStatus;

      // Filtrar por eliminados
      const matchesDeleted = this.showDeleted ? !!empleado.eliminadoEn : !empleado.eliminadoEn;

      return matchesSearch && matchesStatus && matchesDeleted;
    });
  }

  resetForm(): void {
    this.currentEmpleado = {
      nombre: '',
      puesto: '',
      region: '',
      activo: true
    };
    this.isEditing = false;
  }

  editEmpleado(empleado: Empleado): void {
    this.currentEmpleado = { ...empleado };
    this.isEditing = true;
    this.showModal = true;
  }

  saveEmpleado(): void {
    console.log('Guardando empleado:', this.currentEmpleado);
    this.loading = true;

    const operation = this.isEditing 
      ? this.empleadoService.updateEmpleado(this.currentEmpleado.id!, this.currentEmpleado)
      : this.empleadoService.createEmpleado(this.currentEmpleado);

    operation.subscribe({
      next: (result) => {
        console.log('Empleado guardado exitosamente:', result);
        this.showModal = false;
        this.loading = false;
        this.resetForm();
        // Forzar recarga después de un pequeño delay
        setTimeout(() => {
          this.loadEmpleados();
        }, 500);
      },
      error: (err) => {
        console.error('Error saving empleado:', err);
        alert('Error al guardar empleado: ' + (err.message || 'Error desconocido'));
        this.loading = false;
      }
    });
  }

  deleteEmpleado(id: string, soft: boolean = true): void {
    if (confirm('¿Está seguro de eliminar este empleado?')) {
      console.log('Eliminando empleado:', id, 'soft:', soft);
      this.empleadoService.deleteEmpleado(id, soft).subscribe({
        next: (result) => {
          console.log('Empleado eliminado exitosamente:', result);
          this.loadEmpleados();
        },
        error: (err) => {
          console.error('Error deleting empleado:', err);
          alert('Error al eliminar empleado: ' + (err.message || 'Error desconocido'));
        }
      });
    }
  }

  restoreEmpleado(id: string): void {
    this.empleadoService.restoreEmpleado(id).subscribe({
      next: () => {
        this.loadEmpleados();
      },
      error: (err) => console.error('Error restoring empleado:', err)
    });
  }

  deleteEmpleadoPermanente(id: string): void {
    if (confirm('¿Está seguro de ELIMINAR PERMANENTEMENTE este empleado? Esta acción no se puede deshacer.')) {
      console.log('Eliminando empleado permanentemente:', id);
      this.empleadoService.deleteEmpleadoPermanente(id).subscribe({
        next: (result) => {
          console.log('Empleado eliminado permanentemente:', result);
          alert('Empleado eliminado permanentemente');
          this.loadEmpleados();
        },
        error: (err) => {
          console.error('Error deleting empleado permanently:', err);
          alert('Error al eliminar empleado permanentemente: ' + (err.message || 'Error desconocido'));
        }
      });
    }
  }

  toggleShowDeleted(): void {
    this.showDeleted = !this.showDeleted;
    this.filterEmpleados();
  }

  toggleEmpleadoStatus(empleado: Empleado): void {
    const nuevoEstado = !empleado.activo;
    console.log(`Cambiando estado de ${empleado.nombre} de ${empleado.activo} a ${nuevoEstado}`);
    
    this.empleadoService.updateEmpleado(empleado.id, { activo: nuevoEstado }).subscribe({
      next: () => {
        console.log('Estado actualizado exitosamente');
        this.loadEmpleados();
      },
      error: (err) => {
        console.error('Error actualizando estado:', err);
        alert('Error al cambiar estado del empleado');
      }
    });
  }

  // Función temporal para arreglar empleados sin fecha
  fixEmpleadosSinFecha(): void {
    if (confirm('¿Quieres arreglar los empleados que no tienen fecha de creación?')) {
      this.empleados.forEach(empleado => {
        if (!empleado.creadoEn) {
          const empleadoActualizado = {
            ...empleado,
            creadoEn: new Date('2024-01-01'), // Fecha por defecto
            ActualizadoEn: new Date()
          };
          
          this.empleadoService.updateEmpleado(empleado.id, empleadoActualizado).subscribe({
            next: () => console.log('Empleado actualizado:', empleado.id),
            error: (err) => console.error('Error actualizando empleado:', err)
          });
        }
      });
      
      setTimeout(() => {
        this.loadEmpleados();
      }, 2000);
    }
  }
}
