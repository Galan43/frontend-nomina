import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { PermissionsService, Permission, UserRole } from '../../services/permissions.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-usuarios',
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent implements OnInit {
  usuarios: User[] = [];
  filteredUsuarios: User[] = [];
  showModal = false;
  isEditing = false;
  loading = false;
  searchTerm = '';
  filterRole = '';
  showDeleted = false;

  currentUser: Partial<User> = {};
  userPassword: string = '';
  UserRole = UserRole;
  Permission = Permission;

  constructor(
    private userService: UserService,
    public permissionsService: PermissionsService
  ) {}

  ngOnInit(): void {
    this.loadUsuarios();
  }

  // Función para convertir Timestamp de Firebase a Date
  toDate(timestamp: any): Date {
    if (!timestamp) {
      return new Date();
    }
    if (timestamp && timestamp.toDate) {
      return timestamp.toDate();
    }
    if (timestamp && timestamp.seconds) {
      return new Date(timestamp.seconds * 1000);
    }
    return new Date(timestamp);
  }

  loadUsuarios(): void {
    this.userService.getUsers().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.filteredUsuarios = usuarios;
      },
      error: (err) => console.error('Error loading usuarios:', err)
    });
  }

  filterUsuarios(): void {
    this.filteredUsuarios = this.usuarios.filter(usuario => {
      const matchesSearch = !this.searchTerm || 
        usuario.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        usuario.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesRole = !this.filterRole || usuario.rol === this.filterRole;

      // Filtrar por eliminados
      const matchesDeleted = this.showDeleted ? !!usuario.eliminadoEn : !usuario.eliminadoEn;

      return matchesSearch && matchesRole && matchesDeleted;
    });
  }

  resetForm(): void {
    this.currentUser = {
      nombre: '',
      email: '',
      rol: 'EMPLOYEE',
      region: ''
    };
    this.userPassword = '';
    this.isEditing = false;
  }

  editUser(usuario: User): void {
    this.currentUser = { ...usuario };
    this.isEditing = true;
    this.showModal = true;
  }

  saveUser(): void {
    this.loading = true;

    const userData = { ...this.currentUser };
    if (!this.isEditing && this.userPassword) {
      (userData as any).password = this.userPassword;
    }

    const operation = this.isEditing 
      ? this.userService.updateUser(this.currentUser.id!, this.currentUser)
      : this.userService.createUser(userData);

    operation.subscribe({
      next: () => {
        this.showModal = false;
        this.loading = false;
        this.resetForm();
        this.loadUsuarios();
      },
      error: (err) => {
        console.error('Error saving user:', err);
        alert('Error al guardar usuario');
        this.loading = false;
      }
    });
  }

  deleteUser(id: string): void {
    if (confirm('¿Está seguro de eliminar este usuario?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => this.loadUsuarios(),
        error: (err) => console.error('Error deleting user:', err)
      });
    }
  }

  getRoleBadgeClass(rol: string): string {
    switch (rol) {
      case 'ADMIN': return 'bg-danger';
      case 'MANAGER': return 'bg-warning';
      case 'EMPLOYEE': return 'bg-info';
      default: return 'bg-secondary';
    }
  }

  canDeleteUser(usuario: User): boolean {
    const currentUserRole = this.permissionsService.getUserRole();
    
    // ADMIN puede eliminar solo EMPLOYEE
    if (currentUserRole === 'ADMIN') {
      return usuario.rol === 'EMPLOYEE';
    }
    
    // MANAGER puede eliminar ADMIN y EMPLOYEE
    if (currentUserRole === 'MANAGER') {
      return usuario.rol === 'ADMIN' || usuario.rol === 'EMPLOYEE';
    }
    
    // EMPLOYEE no puede eliminar a nadie
    return false;
  }

  canEditUser(usuario: User): boolean {
    const currentUserRole = this.permissionsService.getUserRole();
    
    // ADMIN y MANAGER pueden editar usuarios
    return currentUserRole === 'ADMIN' || currentUserRole === 'MANAGER';
  }

  toggleShowDeleted(): void {
    this.showDeleted = !this.showDeleted;
    this.filterUsuarios();
  }

  restoreUser(id: string): void {
    this.userService.restoreUser(id).subscribe({
      next: () => this.loadUsuarios(),
      error: (err) => console.error('Error restoring user:', err)
    });
  }

  getAvailableRoles(): string[] {
    const currentUserRole = this.permissionsService.getUserRole();
    
    if (currentUserRole === 'ADMIN') {
      return ['EMPLOYEE', 'MANAGER']; // Admin puede asignar EMPLOYEE y MANAGER
    }
    
    if (currentUserRole === 'MANAGER') {
      return ['EMPLOYEE', 'ADMIN']; // Manager puede asignar EMPLOYEE y ADMIN
    }
    
    return []; // EMPLOYEE no puede asignar roles
  }
}
