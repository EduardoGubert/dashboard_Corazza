import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, LoginCredentials } from '../types';
import { supabaseAuth } from '../services/supabaseAuth';

interface AuthContextData {
    user: User | null;
    loading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Verificar se há usuário salvo ao carregar app
    useEffect(() => {
        const loadUser = async () => {
            try {
                const savedUser = localStorage.getItem('user');
                if (savedUser) {
                    const userData = JSON.parse(savedUser);
                    setUser(userData);
                }
            } catch (error) {
                console.error('Erro ao carregar usuário:', error);
                localStorage.removeItem('user');
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    const login = async (credentials: LoginCredentials) => {
        try {
            const { user: userData, error } = await supabaseAuth.login(credentials);
            
            if (error || !userData) {
                throw new Error(error || 'Erro ao fazer login');
            }

            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
        } catch (error: any) {
            throw new Error(error.message || 'Erro ao fazer login');
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    const isAdmin = user?.role === 'Admin';

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
