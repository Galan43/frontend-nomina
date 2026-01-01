# Guía de Testing y Seguridad - Sistema de Nómina

## 🧪 TESTING

### Unit Testing
```bash
# Ejecutar todos los tests unitarios
ng test

# Ejecutar tests con coverage
ng test --code-coverage

# Ejecutar tests en modo watch
ng test --watch

# Ejecutar tests específicos
ng test --include="**/auth.service.spec.ts"
```

### Integration Testing
```bash
# Ejecutar tests de integración
ng test --include="**/integration/*.spec.ts"

# Tests end-to-end (si tienes Cypress/Protractor)
ng e2e
```

### Tests Creados:
1. **auth.service.spec.ts** - Tests del servicio de autenticación
2. **empleados.component.spec.ts** - Tests del componente empleados
3. **auth-integration.spec.ts** - Tests de integración de autenticación

## 🔒 SEGURIDAD

### 1. Validación de Entradas
**Archivo:** `validation.service.ts`

```typescript
// Uso en componentes
constructor(private validationService: ValidationService) {}

// Validar empleado
const validation = this.validationService.validateEmpleado(empleado);
if (!validation.valid) {
  console.error('Errores:', validation.errors);
}
```

### 2. Encriptación de Datos
**Archivo:** `encryption.service.ts`

```typescript
// Uso en servicios
constructor(private encryptionService: EncryptionService) {}

// Guardar datos encriptados
this.encryptionService.setSecureItem('userData', user);

// Recuperar datos encriptados
const user = this.encryptionService.getSecureItem('userData');
```

### 3. Protección de Rutas Frontend
**Archivo:** `security.guard.ts`

```typescript
// En app.routes.ts
{
  path: 'admin',
  component: AdminComponent,
  canActivate: [SecurityGuard],
  data: { role: 'ADMIN' }
}
```

### 4. Reglas de Seguridad Firebase
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Solo usuarios autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Empleados - solo admins pueden crear/eliminar
    match /empleados/{empleadoId} {
      allow read: if request.auth != null;
      allow create, delete: if request.auth.token.role == 'ADMIN';
      allow update: if request.auth != null && 
        (request.auth.token.role == 'ADMIN' || 
         request.auth.token.role == 'MANAGER');
    }
    
    // Nóminas - acceso restringido
    match /nominas/{nominaId} {
      allow read, write: if request.auth != null && 
        (request.auth.token.role == 'ADMIN' || 
         request.auth.token.role == 'MANAGER');
    }
  }
}
```

## 🛡️ IMPLEMENTACIÓN DE SEGURIDAD

### 1. Actualizar AuthService
```typescript
// Agregar al auth.service.ts
import { ValidationService } from './validation.service';
import { EncryptionService } from './encryption.service';

// En el método login
const emailValidation = this.validationService.isValidEmail(credentials.email);
if (!emailValidation) {
  throw new Error('Email no válido');
}
```

### 2. Actualizar Guards
```typescript
// En app.routes.ts - reemplazar AuthGuard con SecurityGuard
import { SecurityGuard } from './guards/security.guard';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [SecurityGuard], // Cambiar aquí
    children: [...]
  }
];
```

### 3. Validación en Componentes
```typescript
// En empleados.component.ts
import { ValidationService } from '../../services/validation.service';

saveEmpleado(): void {
  const validation = this.validationService.validateEmpleado(this.currentEmpleado);
  
  if (!validation.valid) {
    alert('Errores de validación: ' + validation.errors.join(', '));
    return;
  }
  
  // Continuar con el guardado...
}
```

## 📊 COMANDOS DE TESTING

### Instalar dependencias de testing
```bash
npm install --save-dev jasmine karma karma-chrome-headless karma-coverage
```

### Ejecutar suite completa
```bash
# Tests unitarios + coverage
npm run test:coverage

# Tests de seguridad
npm run test:security

# Tests de integración
npm run test:integration
```

### Scripts package.json
```json
{
  "scripts": {
    "test:coverage": "ng test --code-coverage --browsers=ChromeHeadless --watch=false",
    "test:security": "ng test --include='**/security/*.spec.ts'",
    "test:integration": "ng test --include='**/integration/*.spec.ts'"
  }
}
```

## ✅ CHECKLIST DE SEGURIDAD

- [ ] Validación de entradas implementada
- [ ] Encriptación de datos sensibles
- [ ] Guards de seguridad configurados
- [ ] Reglas de Firebase actualizadas
- [ ] Tests unitarios creados
- [ ] Tests de integración implementados
- [ ] Validación de tokens
- [ ] Timeout de sesión configurado
- [ ] Sanitización de inputs
- [ ] Protección contra XSS/CSRF