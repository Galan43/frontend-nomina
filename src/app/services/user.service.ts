import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, query, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from './firebase.config';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  getUsers(): Observable<User[]> {
    return from(
      getDocs(collection(db, 'usuarios')).then(snapshot => 
        snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User))
      )
    );
  }

  createUser(userData: any): Observable<any> {
    return from(
      createUserWithEmailAndPassword(auth, userData.email, userData.password)
        .then(async (userCredential) => {
          const newUser = {
            nombre: userData.nombre,
            email: userData.email,
            rol: userData.rol || 'EMPLOYEE',
            region: userData.region,
            createdAt: new Date()
          };
          
          return await addDoc(collection(db, 'usuarios'), newUser);
        })
    );
  }

  updateUser(id: string, userData: Partial<User>): Observable<any> {
    return from(updateDoc(doc(db, 'usuarios', id), userData));
  }

  deleteUser(id: string): Observable<any> {
    return from(updateDoc(doc(db, 'usuarios', id), { eliminadoEn: new Date() }));
  }

  restoreUser(id: string): Observable<any> {
    return from(updateDoc(doc(db, 'usuarios', id), { eliminadoEn: null }));
  }
}