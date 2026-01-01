import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, from } from 'rxjs';
import { tap } from 'rxjs/operators';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from './firebase.config';
import { User, LoginRequest, SignupRequest, AuthResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.loadUserFromStorage();
  }

  login(credentials: LoginRequest): Observable<any> {
    return from(
      signInWithEmailAndPassword(auth, credentials.email, credentials.password)
        .then(async (userCredential) => {
          // Buscar usuario en Firestore
          const q = query(collection(db, 'usuarios'), where('email', '==', credentials.email));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data() as User;
            this.setSession({ token: await userCredential.user.getIdToken(), user: userData });
            return { token: await userCredential.user.getIdToken(), user: userData };
          }
          throw new Error('Usuario no encontrado');
        })
        .catch((error) => {
          console.error('Firebase Login Error:', error);
          throw error;
        })
    );
  }

  signup(userData: SignupRequest): Observable<any> {
    return from(
      createUserWithEmailAndPassword(auth, userData.email, userData.password)
        .then(async (userCredential) => {
          // Crear usuario en Firestore
          const newUser = {
            nombre: userData.nombre,
            email: userData.email,
            rol: 'EMPLOYEE',
            region: userData.region,
            createdAt: new Date()
          };
          
          await addDoc(collection(db, 'usuarios'), newUser);
          return { message: 'Usuario creado correctamente' };
        })
        .catch((error) => {
          console.error('Firebase Auth Error:', error);
          throw error;
        })
    );
  }

  logout(): void {
    console.log('AuthService: Cerrando sesión...');
    signOut(auth);
    localStorage.clear(); // Limpiar todo el localStorage
    this.currentUserSubject.next(null);
    console.log('AuthService: Sesión cerrada');
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    console.log('AuthService: Verificando token =', !!token);
    console.log('AuthService: Verificando user =', !!user);
    
    // Verificación simple: si hay token y usuario, está autenticado
    if (!token || !user) {
      console.log('AuthService: No hay token o usuario');
      return false;
    }
    
    // Verificar que el usuario actual esté cargado
    if (!this.currentUserSubject.value) {
      try {
        const userData = JSON.parse(user);
        this.currentUserSubject.next(userData);
      } catch (error) {
        console.log('AuthService: Error al parsear usuario:', error);
        this.logout();
        return false;
      }
    }
    
    return true;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private setSession(authResponse: AuthResponse): void {
    localStorage.setItem('token', authResponse.token);
    localStorage.setItem('user', JSON.stringify(authResponse.user));
    this.currentUserSubject.next(authResponse.user);
    
    // Guardar región directamente en localStorage
    localStorage.setItem('user_region', authResponse.user.region);
  }

  private loadUserFromStorage(): void {
    const user = localStorage.getItem('user');
    if (user && this.isAuthenticated()) {
      const userData = JSON.parse(user);
      this.currentUserSubject.next(userData);
      localStorage.setItem('user_region', userData.region);
    }
  }
}