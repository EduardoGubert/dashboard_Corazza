import { supabase } from './supabase';
import bcrypt from 'bcryptjs';

export interface User {
    id: string;
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

export const supabaseAuth = {
    // Login
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        try {
            // Buscar usuário pelo username
            const { data: users, error } = await supabase
                .from('users')
                .select('*')
                .eq('username', credentials.username)
                .limit(1);

            if (error || !users || users.length === 0) {
                return { user: null, error: 'Usuário não encontrado' };
            }

            const user = users[0];

            // Verificar senha com bcrypt
            const isValidPassword = await bcrypt.compare(credentials.password, user.password_hash);

            if (!isValidPassword) {
                return { user: null, error: 'Senha incorreta' };
            }

            // Retornar usuário sem a senha
            const { password_hash, ...userWithoutPassword } = user;
            return { user: userWithoutPassword as User };
        } catch (err: any) {
            return { user: null, error: err.message };
        }
    },

    // Registrar novo usuário (Admin only)
    register: async (userData: RegisterData): Promise<{ user?: User; error?: string }> => {
        try {
            // Hash da senha
            const hashedPassword = await bcrypt.hash(userData.password, 10);

            // Inserir usuário
            const { data, error } = await supabase
                .from('users')
                .insert({
                    username: userData.username,
                    password_hash: hashedPassword,
                    role: userData.role
                })
                .select()
                .single();

            if (error) {
                return { error: error.message };
            }

            const { password_hash, ...userWithoutPassword } = data;
            return { user: userWithoutPassword as User };
        } catch (err: any) {
            return { error: err.message };
        }
    },

    // Obter dados do usuário por ID
    getMe: async (userId: string): Promise<User | null> => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, username, role, created_at')
                .eq('id', userId)
                .single();

            if (error) throw error;
            return data as User;
        } catch (err) {
            console.error('Erro ao buscar usuário:', err);
            return null;
        }
    },

    // Listar todos os usuários (Admin only)
    getUsers: async (): Promise<User[]> => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, username, role, created_at')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as User[];
        } catch (err) {
            console.error('Erro ao listar usuários:', err);
            return [];
        }
    },

    // Deletar usuário (Admin only)
    deleteUser: async (userId: string): Promise<{ error?: string }> => {
        try {
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('id', userId);

            if (error) {
                return { error: error.message };
            }

            return {};
        } catch (err: any) {
            return { error: err.message };
        }
    }
};
