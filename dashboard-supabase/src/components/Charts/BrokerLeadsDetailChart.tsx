import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';

interface Lead {
    id: number;
    nomeCliente: string;
    telefoneCliente: string;
    corretor_responsavel: string;
    created_at: string;
}

interface BrokerLeadsDetail {
    corretor: string;
    totalLeads: number;
    leads: Lead[];
    isExpanded: boolean;
}

const BrokerLeadsDetailChart: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [period, setPeriod] = useState<'7days' | '30days' | '90days' | 'all' | 'custom'>('all');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [brokersData, setBrokersData] = useState<BrokerLeadsDetail[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('📊 Buscando detalhes de leads por corretor...');
            
            // Calcular data inicial baseada no período selecionado
            let startDate: Date | null = null;
            let endDate: Date | null = null;
            const now = new Date();
            
            switch(period) {
                case '7days':
                    startDate = new Date(now.setDate(now.getDate() - 7));
                    break;
                case '30days':
                    startDate = new Date(now.setDate(now.getDate() - 30));
                    break;
                case '90days':
                    startDate = new Date(now.setDate(now.getDate() - 90));
                    break;
                case 'custom':
                    if (customStartDate) {
                        startDate = new Date(customStartDate);
                        startDate.setHours(0, 0, 0, 0);
                    }
                    if (customEndDate) {
                        endDate = new Date(customEndDate);
                        endDate.setHours(23, 59, 59, 999);
                    }
                    break;
                case 'all':
                default:
                    startDate = null;
                    endDate = null;
                    break;
            }

            let query = supabase
                .from('Cadastro_Clientes')
                .select('id, nomeCliente, telefoneCliente, corretor_responsavel, created_at')
                .not('corretor_responsavel', 'is', null)
                .order('created_at', { ascending: false });

            // Aplicar filtro de data se necessário
            if (startDate) {
                query = query.gte('created_at', startDate.toISOString());
            }
            if (endDate) {
                query = query.lte('created_at', endDate.toISOString());
            }

            const { data: leadsData, error } = await query;

            if (error) {
                console.error('❌ Error fetching data:', error);
                setError(error.message);
                return;
            }

            console.log('✅ Dados recebidos:', leadsData);

            // Agrupar leads por corretor
            const grouped: Record<string, Lead[]> = {};
            
            leadsData?.forEach((lead: any) => {
                const corretor = lead.corretor_responsavel?.trim();
                
                if (!corretor || corretor === '') {
                    return;
                }
                
                if (!grouped[corretor]) {
                    grouped[corretor] = [];
                }
                
                grouped[corretor].push({
                    id: lead.id,
                    nomeCliente: lead.nomeCliente || 'Não informado',
                    telefoneCliente: lead.telefoneCliente || 'Não informado',
                    corretor_responsavel: corretor,
                    created_at: lead.created_at
                });
            });

            // Converter para array e ordenar por quantidade de leads
            const brokersArray: BrokerLeadsDetail[] = Object.entries(grouped)
                .map(([corretor, leads]) => ({
                    corretor,
                    totalLeads: leads.length,
                    leads,
                    isExpanded: false
                }))
                .sort((a, b) => b.totalLeads - a.totalLeads);

            console.log('📈 Dados agrupados:', brokersArray);
            setBrokersData(brokersArray);
        } catch (err: any) {
            console.error('❌ Erro ao processar dados:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Realtime subscription
        const channel = supabase
            .channel('broker-details-changes')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'Cadastro_Clientes' },
                () => {
                    console.log('🔄 Mudança detectada, atualizando dados...');
                    fetchData();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [period, customStartDate, customEndDate]);

    const toggleExpand = (index: number) => {
        setBrokersData(prev => prev.map((broker, i) => 
            i === index ? { ...broker, isExpanded: !broker.isExpanded } : broker
        ));
    };

    const filteredBrokers = brokersData.filter(broker =>
        broker.corretor.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Carregando dados...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <strong className="font-bold">Erro!</strong>
                <span className="block sm:inline"> {error}</span>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-700 mb-3">Detalhamento de Leads por Corretor</h2>
                
                {/* Seletor de Período */}
                <div className="flex flex-wrap gap-2 items-center">
                    <button
                        onClick={() => setPeriod('7days')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            period === '7days' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        7 dias
                    </button>
                    <button
                        onClick={() => setPeriod('30days')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            period === '30days' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        30 dias
                    </button>
                    <button
                        onClick={() => setPeriod('90days')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            period === '90days' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        90 dias
                    </button>
                    <button
                        onClick={() => setPeriod('all')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            period === 'all' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Tudo
                    </button>
                    <button
                        onClick={() => setPeriod('custom')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            period === 'custom' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        📅 Período Personalizado
                    </button>
                </div>

                {/* Seletor de Data Personalizado */}
                {period === 'custom' && (
                    <div className="mt-3 flex flex-wrap gap-3 items-center bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">De:</label>
                            <input
                                type="date"
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                                className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">Até:</label>
                            <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        {customStartDate && customEndDate && (
                            <span className="text-sm text-gray-600">
                                ({Math.ceil((new Date(customEndDate).getTime() - new Date(customStartDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} dias)
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Campo de busca */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Buscar corretor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Lista de corretores */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredBrokers.map((broker, index) => (
                    <div key={broker.corretor} className="border border-gray-300 rounded-lg overflow-hidden">
                        {/* Cabeçalho do corretor */}
                        <button
                            onClick={() => toggleExpand(index)}
                            className="w-full px-4 py-3 bg-blue-50 hover:bg-blue-100 transition-colors flex justify-between items-center"
                        >
                            <div className="flex items-center gap-3">
                                <span className="font-semibold text-gray-800">{broker.corretor}</span>
                                <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium">
                                    {broker.totalLeads} {broker.totalLeads === 1 ? 'lead' : 'leads'}
                                </span>
                            </div>
                            <svg
                                className={`w-5 h-5 transition-transform ${broker.isExpanded ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Lista de leads expandida */}
                        {broker.isExpanded && (
                            <div className="bg-white">
                                <table className="w-full">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Cliente</th>
                                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Telefone</th>
                                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Data</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {broker.leads.map((lead) => (
                                            <tr key={lead.id} className="border-t border-gray-200 hover:bg-gray-50">
                                                <td className="px-4 py-2 text-sm text-gray-800">{lead.nomeCliente}</td>
                                                <td className="px-4 py-2 text-sm text-gray-600">{lead.telefoneCliente}</td>
                                                <td className="px-4 py-2 text-sm text-gray-500">
                                                    {new Date(lead.created_at).toLocaleDateString('pt-BR', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Totais */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <strong className="text-gray-700">Total de corretores:</strong>{' '}
                        <span className="text-gray-900">{filteredBrokers.length}</span>
                    </div>
                    <div>
                        <strong className="text-gray-700">Total de leads:</strong>{' '}
                        <span className="text-gray-900">
                            {filteredBrokers.reduce((sum, broker) => sum + broker.totalLeads, 0)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrokerLeadsDetailChart;
