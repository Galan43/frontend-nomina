import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmpleadoService } from '../../services/empleado.service';
import { Puesto } from '../../models/empleado.model';

@Component({
  selector: 'app-puestos',
  imports: [CommonModule, FormsModule],
  templateUrl: './puestos.component.html',
  styleUrl: './puestos.component.css'
})
export class PuestosComponent implements OnInit {
  puestos: Puesto[] = [];
  showModal = false;
  isEditing = false;
  loading = false;

  currentPuesto: Partial<Puesto> = {};

  constructor(private empleadoService: EmpleadoService) {}

  ngOnInit(): void {
    this.loadPuestos();
  }

  loadPuestos(): void {
    this.empleadoService.getPuestos().subscribe({
      next: (puestos) => {
        this.puestos = puestos;
      },
      error: (err) => console.error('Error loading puestos:', err)
    });
  }

  resetForm(): void {
    this.currentPuesto = {
      nombre: '',
      descripcion: '',
      sueldoQuincenal: 0,
      activo: true
    };
    this.isEditing = false;
  }

  editPuesto(puesto: Puesto): void {
    this.currentPuesto = { ...puesto };
    this.isEditing = true;
    this.showModal = true;
  }

  savePuesto(): void {
    this.loading = true;

    const operation = this.isEditing 
      ? this.empleadoService.updatePuesto(this.currentPuesto.id!, this.currentPuesto)
      : this.empleadoService.createPuesto(this.currentPuesto);

    operation.subscribe({
      next: () => {
        this.showModal = false;
        this.loading = false;
        this.loadPuestos();
      },
      error: (err) => {
        console.error('Error saving puesto:', err);
        this.loading = false;
      }
    });
  }

  deletePuesto(id: string): void {
    if (confirm('¿Está seguro de eliminar este puesto?')) {
      this.empleadoService.deletePuesto(id).subscribe({
        next: () => {
          this.loadPuestos();
        },
        error: (err) => console.error('Error deleting puesto:', err)
      });
    }
  }
}
