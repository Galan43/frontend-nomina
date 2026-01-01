import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, getDoc, query, where } from 'firebase/firestore';
import { db } from './firebase.config';
import { Empleado, Puesto, ConceptoNomina, EmpleadoConcepto, NominaQuincenal } from '../models/empleado.model';

@Injectable({
  providedIn: 'root'
})
export class EmpleadoService {

  constructor() {}

  // Empleados
  getEmpleados(): Observable<Empleado[]> {
    return from(
      getDocs(collection(db, 'empleados')).then(snapshot => 
        snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Empleado))
      )
    );
  }

  getEmpleado(id: string): Observable<Empleado> {
    return from(
      getDoc(doc(db, 'empleados', id)).then(docSnap => 
        ({ id: docSnap.id, ...docSnap.data() } as Empleado)
      )
    );
  }

  createEmpleado(empleado: Partial<Empleado>): Observable<any> {
    const empleadoData = {
      ...empleado,
      creadoEn: new Date(),
      activo: empleado.activo !== undefined ? empleado.activo : true,
      ActualizadoEn: new Date()
    };
    console.log('Datos del empleado a crear:', empleadoData);
    return from(addDoc(collection(db, 'empleados'), empleadoData));
  }

  updateEmpleado(id: string, empleado: Partial<Empleado>): Observable<any> {
    const empleadoData = {
      ...empleado,
      ActualizadoEn: new Date()
    };
    return from(updateDoc(doc(db, 'empleados', id), empleadoData));
  }

  deleteEmpleado(id: string, soft: boolean = true): Observable<any> {
    if (soft) {
      return from(updateDoc(doc(db, 'empleados', id), { 
        activo: false, 
        eliminadoEn: new Date() 
      }));
    } else {
      return from(deleteDoc(doc(db, 'empleados', id)));
    }
  }

  deleteEmpleadoPermanente(id: string): Observable<any> {
    return from(deleteDoc(doc(db, 'empleados', id)));
  }

  restoreEmpleado(id: string): Observable<any> {
    return from(updateDoc(doc(db, 'empleados', id), { 
      activo: true, 
      eliminadoEn: null 
    }));
  }

  // Puestos
  getPuestos(): Observable<Puesto[]> {
    return from(
      getDocs(collection(db, 'puestos')).then(snapshot => 
        snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Puesto))
      )
    );
  }

  createPuesto(puesto: Partial<Puesto>): Observable<any> {
    return from(addDoc(collection(db, 'puestos'), puesto));
  }

  updatePuesto(id: string, puesto: Partial<Puesto>): Observable<any> {
    return from(updateDoc(doc(db, 'puestos', id), puesto));
  }

  deletePuesto(id: string): Observable<any> {
    return from(deleteDoc(doc(db, 'puestos', id)));
  }

  // Conceptos
  getConceptos(): Observable<ConceptoNomina[]> {
    return from(
      getDocs(collection(db, 'concepto_nominas')).then(snapshot => 
        snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ConceptoNomina))
      )
    );
  }

  createConcepto(concepto: Partial<ConceptoNomina>): Observable<any> {
    return from(addDoc(collection(db, 'concepto_nominas'), concepto));
  }

  updateConcepto(id: string, concepto: Partial<ConceptoNomina>): Observable<any> {
    return from(updateDoc(doc(db, 'concepto_nominas', id), concepto));
  }

  deleteConcepto(id: string): Observable<any> {
    return from(deleteDoc(doc(db, 'concepto_nominas', id)));
  }

  // Reportes
  getReporteEmpleados(): Observable<any> {
    return this.getEmpleados();
  }

  // Nóminas
  getNominaEmpleado(empleadoId: string): Observable<EmpleadoConcepto[]> {
    return from(
      getDocs(query(collection(db, 'nominas'), where('empleadoId', '==', empleadoId)))
        .then(snapshot => {
          if (!snapshot.empty) {
            const nominaDoc = snapshot.docs[0];
            const nomina = nominaDoc.data() as NominaQuincenal;
            return nomina.conceptos || [];
          }
          return [];
        })
    );
  }

  saveNominaEmpleado(nomina: Partial<NominaQuincenal>): Observable<any> {
    return from(
      getDocs(query(collection(db, 'nominas'), where('empleadoId', '==', nomina.empleadoId)))
        .then(async (snapshot) => {
          if (!snapshot.empty) {
            // Actualizar nómina existente
            const docId = snapshot.docs[0].id;
            return updateDoc(doc(db, 'nominas', docId), {
              ...nomina,
              ActualizadoEn: new Date()
            });
          } else {
            // Crear nueva nómina
            return addDoc(collection(db, 'nominas'), {
              ...nomina,
              createdAt: new Date()
            });
          }
        })
    );
  }
}