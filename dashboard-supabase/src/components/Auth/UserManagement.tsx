import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabaseAuth } from '../../services/supabaseAuth';
import { User, RegisterData } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';

const UserManagement: React.FC = () => {
    const { user: currentUser, logout } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState<RegisterData>({
        username: '',
        password: '',
        role: 'Corretor',
    });
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await supabaseAuth.getUsers();
            setUsers(data);
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar usuários');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setSuccessMessage('');
        setFormLoading(true);

        try {
            const { error: registerError } = await supabaseAuth.register(formData);
            
            if (registerError) {
                setFormError(registerError);
                return;
            }

            setSuccessMessage('Usuário criado com sucesso!');
            setFormData({ username: '', password: '', role: 'Corretor' });
            setShowForm(false);
            fetchUsers();
        } catch (err: any) {
            setFormError(err.message || 'Erro ao criar usuário');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (userId: string, username: string) => {
        if (userId === currentUser?.id) {
            alert('Você não pode deletar seu próprio usuário!');
            return;
        }

        if (!window.confirm(`Tem certeza que deseja deletar o usuário "${username}"?`)) {
            return;
        }

        try {
            const { error: deleteError } = await supabaseAuth.deleteUser(userId);
            
            if (deleteError) {
                setError(deleteError);
                return;
            }

            setSuccessMessage('Usuário deletado com sucesso!');
            fetchUsers();
        } catch (err: any) {
            setError(err.message || 'Erro ao deletar usuário');
        }
    };

    if (loading) {
        return <LoadingSpinner color="purple" />;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Gerenciar Usuários</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Logado como: <span className="font-medium">{currentUser?.username}</span>
                                <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                    {currentUser?.role}
                                </span>
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Link
                                to="/dashboard"
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                            >
                                ← Voltar ao Dashboard
                            </Link>
                            <button
                                onClick={logout}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                            >
                                Sair
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Messages */}
                {error && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}
                {successMessage && (
                    <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                        {successMessage}
                    </div>
                )}

                {/* Add User Button */}
                <div className="mb-6">
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                        {showForm ? '✕ Cancelar' : '+ Adicionar Novo Usuário'}
                    </button>
                </div>

                {/* Add User Form */}
                {showForm && (
                    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Novo Usuário</h2>
                        {formError && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                {formError}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Usuário</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Digite o nome de usuário"
                                    required
                                    disabled={formLoading}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Senha</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Digite a senha"
                                    required
                                    disabled={formLoading}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Função</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'Admin' | 'Corretor' })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    disabled={formLoading}
                                >
                                    <option value="Corretor">Corretor</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={formLoading}
                                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {formLoading ? 'Criando...' : 'Criar Usuário'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Users List */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="px-6 py-4 bg-purple-600 text-white">
                        <h2 className="text-xl font-bold">Usuários ({users.length})</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Usuário</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Função</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Criado em</th>
                                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {users.map((u) => (
                                    <tr key={u.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                                            {u.username}
                                            {u.id === currentUser?.id && (
                                                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                    Você
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                u.role === 'Admin' 
                                                    ? 'bg-purple-100 text-purple-800' 
                                                    : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(u.created_at).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleDelete(u.id, u.username)}
                                                disabled={u.id === currentUser?.id}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                    u.id === currentUser?.id
                                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                        : 'bg-red-600 text-white hover:bg-red-700'
                                                }`}
                                            >
                                                Deletar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
