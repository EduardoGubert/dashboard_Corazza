// Auth Types
export interface User {
    id: string;  // UUID do Supabase
    username: string;
    role: 'Admin' | 'Corretor';
    created_at: string;
}

export interface AuthResponse {
    user: User | null;
    error?: string;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterData {
    username: string;
    password: string;
    role: 'Admin' | 'Corretor';
}

// Existing Types
export interface Lead {
  id: number;
  name: string;
  empreendimento: string;
  created_at: string;
}

export interface Schedule {
  id: number;
  lead_id: number;
  date: string;
  broker_id: number;
}

export interface Broker {
  id: number;
  name: string;
  leads_count: number;
}

export interface SupabaseResponse<T> {
  data: T | null;
  error: string | null;
}