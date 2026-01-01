export interface Empleado {
  id: string;
  nombre: string;
  email?: string;
  passworkhash?: string;
  rol?: string;
  puesto: string;
  region: string;
  activo: boolean;
  creadoEn: Date;
  ActualizadoEn?: Date;
  eliminadoEn?: Date;
}

export interface Puesto {
  id: string;
  nombre: string;
  descripcion: string;
  sueldoQuincenal: number;
  porcentajeIncremento?: number;
  ultimoIncremento?: Date;
  activo: boolean;
  createdAt: Date;
}

export interface ConceptoNomina {
  id: string;
  nombre: string;
  descripcion?: string;
  tipo: 'PERCEPCION' | 'DEDUCCION';
  importe: number;
  region: string;
  activo: boolean;
  createdAt: Date;
  eliminadoEn?: Date;
}

export interface EmpleadoConcepto {
  id: string;
  empleadoId: string;
  conceptoId: string;
  nombre: string;
  tipo: 'PERCEPCION' | 'DEDUCCION';
  importe: number;
  activo: boolean;
  createdAt: Date;
}

export interface NominaQuincenal {
  id: string;
  empleadoId: string;
  periodo: string; // 'YYYY-MM-DD' formato
  conceptos: EmpleadoConcepto[];
  totalPercepciones: number;
  totalDeducciones: number;
  sueldoNeto: number;
  createdAt: Date;
}

export interface PuestoConcepto {
  id: string;
  puestoId: string;
  conceptoId: string;
  activo: boolean;
  createdAt: Date;
}