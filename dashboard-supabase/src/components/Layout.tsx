import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC = () => {
    const { user, logout, isAdmin } = useAuth();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Dashboard Corazza</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Bem-vindo, <span className="font-medium">{user?.username}</span>
                                {user?.role && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    {user.role}
                                </span>}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            {isAdmin && (
                                <Link
                                    to="/users"
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                                >
                                    👥 Gerenciar Usuários
                                </Link>
                            )}
                            <button
                                onClick={logout}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                            >
                                Sair
                            </button>
                        </div>
                    </div>

                    {/* Abas de Navegação */}
                    <div className="mt-4 border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            <Link
                                to="/dashboard"
                                className={`
                                    py-2 px-1 border-b-2 font-medium text-sm transition-colors
                                    ${isActive('/dashboard')
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }
                                `}
                            >
                                📊 Dashboard
                            </Link>
                            <Link
                                to="/fechamento"
                                className={`
                                    py-2 px-1 border-b-2 font-medium text-sm transition-colors
                                    ${isActive('/fechamento')
                                        ? 'border-green-500 text-green-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }
                                `}
                            >
                                ✅ Fechamento
                            </Link>
                        </nav>
                    </div>
                </div>
            </div>

            {/* Conteúdo da página */}
            <div className="w-full">
                <div className="p-3 sm:p-4 md:p-6">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Layout;
