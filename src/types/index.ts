export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'Responsabile' | 'Dipendente';
}

export interface CategoriaAcquisto {
  _id?: string; // MongoDB ID
  id?: string;  // Alias per compatibilità
  descrizione: string;
  costo?: number;
}

export interface RichiestaAcquisto {
  _id?: string; // Mongoose ID
  id?: string;  // Alias per compatibilità
  idUtente: string | User;
  idCategoria: string;
  quantita: number;
  costo: number;
  motivazione: string;
  dataRichiesta: Date;
  stato: 'In attesa' | 'Approvata' | 'Rifiutata';
  dataapprovazione?: Date;
  idapprovatore?: string | User;
}

export interface CreateRichiestaDto {
  idCategoria: string;
  quantita: number;
  costo: number;
  motivazione: string;
}

export interface UpdateRichiestaDto {
  idCategoria: string;
  quantita: number;
  costo: number;
  motivazione: string;
}

export interface CreateCategoriaDto {
  descrizione: string;
  costo?: number;
}

export interface UpdateCategoriaDto {
  descrizione: string;
  costo?: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  role: 'Responsabile' | 'Dipendente';
}

export interface AuthResponse {
  token: string;
  user: User;
} 