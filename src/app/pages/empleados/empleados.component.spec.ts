import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { EmpleadosComponent } from './empleados.component';
import { EmpleadoService } from '../../services/empleado.service';
import { Empleado } from '../../models/empleado.model';

describe('EmpleadosComponent', () => {
  let component: EmpleadosComponent;
  let fixture: ComponentFixture<EmpleadosComponent>;
  let mockEmpleadoService: jasmine.SpyObj<EmpleadoService>;

  const mockEmpleados: Empleado[] = [
    {
      id: '1',
      nombre: 'Juan Pérez',
      puesto: 'Desarrollador',
      region: 'Norte',
      activo: true,
      creadoEn: new Date()
    },
    {
      id: '2',
      nombre: 'María García',
      puesto: 'Analista',
      region: 'Sur',
      activo: false,
      creadoEn: new Date()
    }
  ];

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('EmpleadoService', [
      'getEmpleados', 'createEmpleado', 'updateEmpleado', 'deleteEmpleado', 'restoreEmpleado'
    ]);

    await TestBed.configureTestingModule({
      imports: [EmpleadosComponent, FormsModule],
      providers: [
        { provide: EmpleadoService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EmpleadosComponent);
    component = fixture.componentInstance;
    mockEmpleadoService = TestBed.inject(EmpleadoService) as jasmine.SpyObj<EmpleadoService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load empleados on init', () => {
    mockEmpleadoService.getEmpleados.and.returnValue(of(mockEmpleados));
    
    component.ngOnInit();
    
    expect(mockEmpleadoService.getEmpleados).toHaveBeenCalled();
    expect(component.empleados).toEqual(mockEmpleados);
    expect(component.filteredEmpleados).toEqual(mockEmpleados);
  });

  it('should filter empleados by search term', () => {
    component.empleados = mockEmpleados;
    component.searchTerm = 'Juan';
    
    component.filterEmpleados();
    
    expect(component.filteredEmpleados.length).toBe(1);
    expect(component.filteredEmpleados[0].nombre).toBe('Juan Pérez');
  });

  it('should filter empleados by status', () => {
    component.empleados = mockEmpleados;
    component.filterStatus = 'true';
    
    component.filterEmpleados();
    
    expect(component.filteredEmpleados.length).toBe(1);
    expect(component.filteredEmpleados[0].activo).toBe(true);
  });

  it('should reset form correctly', () => {
    component.resetForm();
    
    expect(component.currentEmpleado.nombre).toBe('');
    expect(component.currentEmpleado.puesto).toBe('');
    expect(component.currentEmpleado.region).toBe('');
    expect(component.currentEmpleado.activo).toBe(true);
    expect(component.isEditing).toBe(false);
  });

  it('should save new empleado', () => {
    const newEmpleado = {
      nombre: 'Carlos López',
      puesto: 'Gerente',
      region: 'Centro',
      activo: true
    };
    
    component.currentEmpleado = newEmpleado;
    component.isEditing = false;
    mockEmpleadoService.createEmpleado.and.returnValue(of({}));
    mockEmpleadoService.getEmpleados.and.returnValue(of(mockEmpleados));
    
    component.saveEmpleado();
    
    expect(mockEmpleadoService.createEmpleado).toHaveBeenCalledWith(newEmpleado);
  });

  it('should handle save error', () => {
    spyOn(window, 'alert');
    component.currentEmpleado = { nombre: 'Test' };
    mockEmpleadoService.createEmpleado.and.returnValue(throwError({ message: 'Error de red' }));
    
    component.saveEmpleado();
    
    expect(window.alert).toHaveBeenCalledWith('Error al guardar empleado: Error de red');
  });

  it('should convert timestamp to date', () => {
    const mockTimestamp = {
      toDate: () => new Date('2024-01-01')
    };
    
    const result = component.toDate(mockTimestamp);
    
    expect(result).toEqual(new Date('2024-01-01'));
  });

  it('should handle null timestamp', () => {
    const result = component.toDate(null);
    
    expect(result).toBeInstanceOf(Date);
  });
});