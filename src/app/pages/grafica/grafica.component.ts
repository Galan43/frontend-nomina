import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmpleadoService } from '../../services/empleado.service';
import { Empleado, Puesto, ConceptoNomina } from '../../models/empleado.model';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

// Interfaces para datos de gráficas
interface EmpleadoPorPuesto {
  puesto: string;
  cantidad: number;
}

interface SueldoPorPuesto {
  puesto: string;
  sueldo: number;
  empleados: number;
}

interface ConceptoPorTipo {
  tipo: string;
  cantidad: number;
}

interface EstadisticasNomina {
  totalEmpleados: number;
  empleadosActivos: number;
  empleadosInactivos: number;
  totalNominaQuincenal: number;
  totalNominaMensual: number;
  promedioSueldo: number;
  totalPuestos: number;
  totalConceptos: number;
}

@Component({
  selector: 'app-grafica',
  imports: [CommonModule],
  templateUrl: './grafica.component.html',
  styleUrl: './grafica.component.css'
})
export class GraficaComponent implements OnInit, OnDestroy {
  @ViewChild('empleadosChart', { static: true }) empleadosChart!: ElementRef;
  @ViewChild('sueldosChart', { static: true }) sueldosChart!: ElementRef;
  @ViewChild('conceptosChart', { static: true }) conceptosChart!: ElementRef;

  // Estadísticas principales
  stats: EstadisticasNomina = {
    totalEmpleados: 0,
    empleadosActivos: 0,
    empleadosInactivos: 0,
    totalNominaQuincenal: 0,
    totalNominaMensual: 0,
    promedioSueldo: 0,
    totalPuestos: 0,
    totalConceptos: 0
  };

  // Datos para gráficas
  empleadosPorPuesto: EmpleadoPorPuesto[] = [];
  sueldosPorPuesto: SueldoPorPuesto[] = [];
  conceptosPorTipo: ConceptoPorTipo[] = [];

  // Referencias a gráficas
  private chartEmpleados: Chart | null = null;
  private chartSueldos: Chart | null = null;
  private chartConceptos: Chart | null = null;

  // Colores para gráficas
  private readonly CHART_COLORS = {
    empleados: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
    sueldos: '#36A2EB',
    conceptos: ['#4BC0C0', '#FF9F40', '#FF6384', '#36A2EB']
  };

  constructor(private empleadoService: EmpleadoService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngOnDestroy(): void {
    this.destruirGraficas();
  }

  // Getters para acceso fácil a estadísticas
  get totalEmpleados() { return this.stats.totalEmpleados; }
  get empleadosActivos() { return this.stats.empleadosActivos; }
  get empleadosInactivos() { return this.stats.empleadosInactivos; }
  get totalNominaQuincenal() { return this.stats.totalNominaQuincenal; }
  get totalNominaMensual() { return this.stats.totalNominaMensual; }
  get promedioSueldo() { return this.stats.promedioSueldo; }
  get totalPuestos() { return this.stats.totalPuestos; }
  get totalConceptos() { return this.stats.totalConceptos; }

  private cargarDatos(): void {
    this.cargarEmpleados();
    this.cargarConceptos();
  }

  private cargarEmpleados(): void {
    this.empleadoService.getEmpleados().subscribe({
      next: (empleados) => {
        this.procesarDatosEmpleados(empleados);
        this.cargarPuestos(empleados);
      },
      error: (error) => console.error('Error al cargar empleados:', error)
    });
  }

  private cargarPuestos(empleados: Empleado[]): void {
    this.empleadoService.getPuestos().subscribe({
      next: (puestos) => {
        this.procesarDatosPuestos(puestos, empleados);
        this.crearGraficas();
      },
      error: (error) => console.error('Error al cargar puestos:', error)
    });
  }

  private cargarConceptos(): void {
    this.empleadoService.getConceptos().subscribe({
      next: (conceptos) => this.procesarDatosConceptos(conceptos),
      error: (error) => console.error('Error al cargar conceptos:', error)
    });
  }

  private procesarDatosEmpleados(empleados: Empleado[]): void {
    this.stats.totalEmpleados = empleados.length;
    this.stats.empleadosActivos = empleados.filter(e => e.activo).length;
    this.stats.empleadosInactivos = this.stats.totalEmpleados - this.stats.empleadosActivos;
    
    this.calcularEmpleadosPorPuesto(empleados);
  }

  private calcularEmpleadosPorPuesto(empleados: Empleado[]): void {
    const contadorPuestos = new Map<string, number>();
    
    empleados
      .filter(empleado => empleado.activo && empleado.puesto)
      .forEach(empleado => {
        const cantidad = contadorPuestos.get(empleado.puesto) || 0;
        contadorPuestos.set(empleado.puesto, cantidad + 1);
      });

    this.empleadosPorPuesto = Array.from(contadorPuestos.entries())
      .map(([puesto, cantidad]) => ({ puesto, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }

  private procesarDatosPuestos(puestos: Puesto[], empleados: Empleado[]): void {
    this.stats.totalPuestos = puestos.length;
    
    const { totalNomina, sueldoPromedio, sueldosPorPuesto } = this.calcularDatosNomina(puestos, empleados);
    
    this.stats.totalNominaQuincenal = totalNomina;
    this.stats.totalNominaMensual = totalNomina * 2;
    this.stats.promedioSueldo = sueldoPromedio;
    this.sueldosPorPuesto = sueldosPorPuesto;
  }

  private calcularDatosNomina(puestos: Puesto[], empleados: Empleado[]) {
    let totalNomina = 0;
    let totalSueldos = 0;
    const sueldosPorPuesto: SueldoPorPuesto[] = [];

    puestos.forEach(puesto => {
      const empleadosEnPuesto = empleados.filter(e => 
        e.activo && e.puesto === puesto.nombre
      ).length;
      
      const sueldoTotal = (puesto.sueldoQuincenal || 0) * empleadosEnPuesto;
      totalNomina += sueldoTotal;
      totalSueldos += puesto.sueldoQuincenal || 0;

      if (empleadosEnPuesto > 0) {
        sueldosPorPuesto.push({
          puesto: puesto.nombre,
          sueldo: puesto.sueldoQuincenal || 0,
          empleados: empleadosEnPuesto
        });
      }
    });

    return {
      totalNomina,
      sueldoPromedio: puestos.length > 0 ? totalSueldos / puestos.length : 0,
      sueldosPorPuesto: sueldosPorPuesto.sort((a, b) => b.sueldo - a.sueldo)
    };
  }

  private procesarDatosConceptos(conceptos: ConceptoNomina[]): void {
    this.stats.totalConceptos = conceptos.length;
    
    const contadorTipos = new Map<string, number>();
    
    conceptos.forEach(concepto => {
      const tipo = concepto.tipo || 'Sin tipo';
      const cantidad = contadorTipos.get(tipo) || 0;
      contadorTipos.set(tipo, cantidad + 1);
    });

    this.conceptosPorTipo = Array.from(contadorTipos.entries())
      .map(([tipo, cantidad]) => ({ tipo, cantidad }));
  }

  private crearGraficas(): void {
    setTimeout(() => {
      this.crearGraficaEmpleados();
      this.crearGraficaSueldos();
      this.crearGraficaConceptos();
    }, 100);
  }

  private crearGraficaEmpleados(): void {
    if (!this.empleadosChart?.nativeElement || this.empleadosPorPuesto.length === 0) return;
    
    const ctx = this.empleadosChart.nativeElement.getContext('2d');
    
    this.chartEmpleados = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.empleadosPorPuesto.map(item => item.puesto),
        datasets: [{
          data: this.empleadosPorPuesto.map(item => item.cantidad),
          backgroundColor: this.CHART_COLORS.empleados,
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: this.obtenerOpcionesGraficaCircular('Distribución de Empleados por Puesto')
    });
  }

  private crearGraficaSueldos(): void {
    if (!this.sueldosChart?.nativeElement || this.sueldosPorPuesto.length === 0) return;
    
    const ctx = this.sueldosChart.nativeElement.getContext('2d');
    
    this.chartSueldos = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.sueldosPorPuesto.map(item => item.puesto),
        datasets: [{
          label: 'Sueldo Quincenal',
          data: this.sueldosPorPuesto.map(item => item.sueldo),
          backgroundColor: this.CHART_COLORS.sueldos,
          borderColor: '#1E88E5',
          borderWidth: 1
        }]
      },
      options: this.obtenerOpcionesGraficaBarras('Sueldos Quincenales por Puesto')
    });
  }

  private crearGraficaConceptos(): void {
    if (!this.conceptosChart?.nativeElement || this.conceptosPorTipo.length === 0) return;
    
    const ctx = this.conceptosChart.nativeElement.getContext('2d');
    
    this.chartConceptos = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: this.conceptosPorTipo.map(item => item.tipo),
        datasets: [{
          data: this.conceptosPorTipo.map(item => item.cantidad),
          backgroundColor: this.CHART_COLORS.conceptos,
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: this.obtenerOpcionesGraficaCircular('Conceptos de Nómina por Tipo')
    });
  }

  private obtenerOpcionesGraficaCircular(titulo: string): ChartConfiguration['options'] {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true
          }
        },
        title: {
          display: true,
          text: titulo,
          font: {
            size: 16,
            weight: 'bold'
          }
        }
      }
    };
  }

  private obtenerOpcionesGraficaBarras(titulo: string): ChartConfiguration['options'] {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: titulo,
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '$' + Number(value).toLocaleString();
            }
          }
        },
        x: {
          ticks: {
            maxRotation: 45
          }
        }
      }
    };
  }

  private destruirGraficas(): void {
    if (this.chartEmpleados) {
      this.chartEmpleados.destroy();
    }
    if (this.chartSueldos) {
      this.chartSueldos.destroy();
    }
    if (this.chartConceptos) {
      this.chartConceptos.destroy();
    }
  }
}