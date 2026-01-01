import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  private readonly secretKey = 'nomina-app-secret-key-2024';

  // Encriptar datos
  encrypt(data: string): string {
    try {
      return CryptoJS.AES.encrypt(data, this.secretKey).toString();
    } catch (error) {
      console.error('Error encrypting data:', error);
      return data;
    }
  }

  // Desencriptar datos
  decrypt(encryptedData: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.secretKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Error decrypting data:', error);
      return encryptedData;
    }
  }

  // Encriptar objeto
  encryptObject(obj: any): string {
    try {
      const jsonString = JSON.stringify(obj);
      return this.encrypt(jsonString);
    } catch (error) {
      console.error('Error encrypting object:', error);
      return JSON.stringify(obj);
    }
  }

  // Desencriptar objeto
  decryptObject(encryptedData: string): any {
    try {
      const decryptedString = this.decrypt(encryptedData);
      return JSON.parse(decryptedString);
    } catch (error) {
      console.error('Error decrypting object:', error);
      return null;
    }
  }

  // Hash para contraseñas (solo para validación, Firebase maneja auth)
  hashPassword(password: string): string {
    return CryptoJS.SHA256(password).toString();
  }

  // Generar token seguro
  generateSecureToken(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    return CryptoJS.SHA256(timestamp + random).toString();
  }

  // Encriptar datos sensibles para localStorage
  setSecureItem(key: string, value: any): void {
    try {
      const encryptedValue = this.encryptObject(value);
      localStorage.setItem(key, encryptedValue);
    } catch (error) {
      console.error('Error setting secure item:', error);
    }
  }

  // Desencriptar datos de localStorage
  getSecureItem(key: string): any {
    try {
      const encryptedValue = localStorage.getItem(key);
      if (!encryptedValue) return null;
      
      return this.decryptObject(encryptedValue);
    } catch (error) {
      console.error('Error getting secure item:', error);
      return null;
    }
  }

  // Limpiar datos sensibles
  clearSecureData(): void {
    const sensitiveKeys = ['user', 'token', 'nomina_data'];
    sensitiveKeys.forEach(key => {
      localStorage.removeItem(key);
    });
  }
}