import axios, { InternalAxiosRequestConfig } from 'axios';
import { AuthResponse, LoginCredentials, RegisterData, User } from '../types';

const API_URL = process.env.REACT_APP_AUTH_API_URL || 'http://localhost:5000/api/auth';

const api = axios.create({
    baseURL: API_URL,
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authService = {
    // Login
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const { data } = await api.post<AuthResponse>('/login', credentials);
        return data;
    },

    // Registrar novo usuário (Admin only)
    register: async (userData: RegisterData): Promise<{ message: string; user: User }> => {
        const { data } = await api.post('/register', userData);
        return data;
    },

    // Obter dados do usuário logado
    getMe: async (): Promise<User> => {
        const { data } = await api.get<User>('/me');
        return data;
    },

    // Listar todos os usuários (Admin only)
    getUsers: async (): Promise<User[]> => {
        const { data } = await api.get<User[]>('/users');
        return data;
    },

    // Deletar usuário (Admin only)
    deleteUser: async (userId: number): Promise<{ message: string }> => {
        const { data } = await api.delete(`/users/${userId}`);
        return data;
    },
};

export default authService;
