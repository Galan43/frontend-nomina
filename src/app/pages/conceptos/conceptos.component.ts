import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmpleadoService } from '../../services/empleado.service';
import { ConceptoNomina } from '../../models/empleado.model';

@Component({
  selector: 'app-conceptos',
  imports: [CommonModule, FormsModule],
  templateUrl: './conceptos.component.html',
  styleUrl: './conceptos.component.css'
})
export class ConceptosComponent implements OnInit {
  conceptos: ConceptoNomina[] = [];
  filteredConceptos: ConceptoNomina[] = [];
  showModal = false;
  isEditing = false;
  loading = false;
  filterTipo = '';

  currentConcepto: Partial<ConceptoNomina> = {};

  constructor(private empleadoService: EmpleadoService) {}

  ngOnInit(): void {
    this.loadConceptos();
  }

  loadConceptos(): void {
    this.empleadoService.getConceptos().subscribe({
      next: (conceptos) => {
        this.conceptos = conceptos;
        this.filteredConceptos = conceptos;
      },
      error: (err) => console.error('Error loading conceptos:', err)
    });
  }

  filterConceptos(): void {
    this.filteredConceptos = this.conceptos.filter(concepto => {
      return !this.filterTipo || concepto.tipo === this.filterTipo;
    });
  }

  resetForm(): void {
    this.currentConcepto = {
      nombre: '',
      tipo: 'PERCEPCION',
      importe: 0,
      activo: true
    };
    this.isEditing = false;
  }

  editConcepto(concepto: ConceptoNomina): void {
    this.currentConcepto = { ...concepto };
    this.isEditing = true;
    this.showModal = true;
  }

  saveConcepto(): void {
    this.loading = true;

    const operation = this.isEditing 
      ? this.empleadoService.updateConcepto(this.currentConcepto.id!, this.currentConcepto)
      : this.empleadoService.createConcepto(this.currentConcepto);

    operation.subscribe({
      next: () => {
        this.showModal = false;
        this.loading = false;
        this.loadConceptos();
      },
      error: (err) => {
        console.error('Error saving concepto:', err);
        this.loading = false;
      }
    });
  }

  deleteConcepto(id: string): void {
    if (confirm('¿Está seguro de eliminar este concepto?')) {
      this.empleadoService.deleteConcepto(id).subscribe({
        next: () => {
          this.loadConceptos();
        },
        error: (err) => console.error('Error deleting concepto:', err)
      });
    }
  }
}
