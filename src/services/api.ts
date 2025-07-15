import axios from 'axios';
import type { 
  CategoriaAcquisto, 
  RichiestaAcquisto, 
  CreateRichiestaDto, 
  UpdateRichiestaDto, 
  CreateCategoriaDto,
  LoginRequest,
  RegisterRequest,
  AuthResponse
} from '../types';

const API_BASE_URL = 'http://localhost:3000/api';

// Configurazione axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor per aggiungere il token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor per gestire errori di autenticazione
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/register', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// Richieste API
export const richiesteAPI = {
  getAll: async (): Promise<RichiestaAcquisto[]> => {
    const response = await api.get('/richieste');
    return response.data;
  },

  getById: async (id: string): Promise<RichiestaAcquisto> => {
    const response = await api.get(`/richieste/${id}`);
    return response.data;
  },

  create: async (richiesta: CreateRichiestaDto): Promise<RichiestaAcquisto> => {
    const response = await api.post('/richieste', richiesta);
    return response.data;
  },

  update: async (id: string, richiesta: UpdateRichiestaDto): Promise<RichiestaAcquisto> => {
    const response = await api.put(`/richieste/${id}`, richiesta);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/richieste/${id}`);
  },

  getPending: async (): Promise<RichiestaAcquisto[]> => {
    const response = await api.get('/richieste/pending/approve');
    return response.data;
  },

  approve: async (id: string): Promise<RichiestaAcquisto> => {
    const response = await api.put(`/richieste/${id}/approve`);
    return response.data;
  },

  reject: async (id: string): Promise<RichiestaAcquisto> => {
    const response = await api.put(`/richieste/${id}/reject`);
    return response.data;
  },

  getProcessed: async (): Promise<RichiestaAcquisto[]> => {
    const response = await api.get('/richieste/processed');
    return response.data;
  },

  changeStatus: async (id: string, stato: 'In attesa' | 'Approvata' | 'Rifiutata'): Promise<RichiestaAcquisto> => {
    const response = await api.put(`/richieste/${id}/status`, { stato });
    return response.data;
  }
};

// Categorie API
export const categorieAPI = {
  getAll: async (): Promise<CategoriaAcquisto[]> => {
    const response = await api.get('/categorie');
    return response.data;
  },

  create: async (categoria: CreateCategoriaDto): Promise<CategoriaAcquisto> => {
    const response = await api.post('/categorie', categoria);
    return response.data;
  },

  update: async (id: string, categoria: CreateCategoriaDto): Promise<CategoriaAcquisto> => {
    const response = await api.put(`/categorie/${id}`, categoria);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/categorie/${id}`);
  }
};

export default api; 