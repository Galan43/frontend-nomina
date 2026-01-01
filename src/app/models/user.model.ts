export interface User {
  id: string;
  nombre: string;
  email: string;
  passworkhash: string;
  rol: string;
  region: string;
  createdAt: Date;
  eliminadoEn?: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  nombre: string;
  email: string;
  password: string;
  region: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}