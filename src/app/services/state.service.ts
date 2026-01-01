import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private readonly STORAGE_KEY = 'nomina_app_state';
  
  // Estados reactivos
  private regionSubject = new BehaviorSubject<string>('');
  public region$ = this.regionSubject.asObservable();

  private empleadosCountSubject = new BehaviorSubject<number>(0);
  public empleadosCount$ = this.empleadosCountSubject.asObservable();

  constructor() {
    this.loadStateFromStorage();
  }

  // Gestión de región
  setRegion(region: string): void {
    this.regionSubject.next(region);
    this.saveStateToStorage();
  }

  getRegion(): string {
    return this.regionSubject.value;
  }

  // Gestión de contadores
  setEmpleadosCount(count: number): void {
    this.empleadosCountSubject.next(count);
  }

  getEmpleadosCount(): number {
    return this.empleadosCountSubject.value;
  }

  // Persistencia en localStorage
  private saveStateToStorage(): void {
    const state = {
      region: this.regionSubject.value,
      empleadosCount: this.empleadosCountSubject.value,
      timestamp: new Date().getTime()
    };
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
  }

  private loadStateFromStorage(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    
    if (stored) {
      try {
        const state = JSON.parse(stored);
        const now = new Date().getTime();
        const tenMinutes = 10 * 60 * 1000;
        
        // Verificar si el estado no ha expirado (10 minutos)
        if (state.timestamp && (now - state.timestamp) < tenMinutes) {
          this.regionSubject.next(state.region || '');
          this.empleadosCountSubject.next(state.empleadosCount || 0);
        } else {
          // Estado expirado, limpiar
          this.clearState();
        }
      } catch (error) {
        console.error('Error loading state from storage:', error);
        this.clearState();
      }
    }
  }

  clearState(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.regionSubject.next('');
    this.empleadosCountSubject.next(0);
  }

  // Utilidades para filtros por región
  filterByUserRegion<T extends { region: string }>(items: T[]): T[] {
    const userRegion = this.getRegion();
    if (!userRegion) return items;
    
    return items.filter(item => item.region === userRegion);
  }
}