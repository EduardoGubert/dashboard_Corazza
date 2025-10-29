import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { usePeriodFilter } from '../../hooks/usePeriodFilter';
import PeriodSelector from '../common/PeriodSelector';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import ChartContainer from '../common/ChartContainer';
import { applyDateFilter } from '../../utils/supabaseHelpers';

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
    
    // ✅ Hook centralizado para gerenciar o filtro de período
    const periodFilter = usePeriodFilter();
    
    const [brokersData, setBrokersData] = useState<BrokerLeadsDetail[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // ✅ Utiliza função centralizada para aplicar filtro de data
            let query = supabase
                .from('Cadastro_Clientes')
                .select('id, nomeCliente, telefoneCliente, corretor_responsavel, created_at')
                .not('corretor_responsavel', 'is', null)
                .order('created_at', { ascending: false });

            query = applyDateFilter(query, periodFilter.dateRange);

            const { data: leadsData, error } = await query;

            if (error) {
                console.error('❌ Error fetching data:', error);
                setError(error.message);
                return;
            }

            // ✅ Agrupar leads por corretor
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
                    fetchData();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [periodFilter.dateRange]); // ✅ Depende apenas do dateRange calculado

    const toggleExpand = (index: number) => {
        setBrokersData(prev => prev.map((broker, i) => 
            i === index ? { ...broker, isExpanded: !broker.isExpanded } : broker
        ));
    };

    const filteredBrokers = brokersData.filter(broker =>
        broker.corretor.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ✅ Componente reutilizável para loading
    if (loading) {
        return <LoadingSpinner color="blue" />;
    }

    // ✅ Componente reutilizável para erro
    if (error) {
        return <ErrorMessage message={error} />;
    }

    return (
        <div className="w-full">
            {/* ✅ Componente reutilizável para título */}
            <ChartContainer title="Detalhamento de Leads por Corretor">
                {/* ✅ Componente reutilizável para seletor de período */}
                <PeriodSelector {...periodFilter} color="blue" />

                {/* Campo de busca */}
                <div className="mb-3 sm:mb-4">
                    <input
                        type="text"
                        placeholder="Buscar corretor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Lista de corretores com altura responsiva */}
                <div className="space-y-3 max-h-72 sm:max-h-80 md:max-h-96 overflow-y-auto">
                    {filteredBrokers.map((broker, index) => (
                        <div key={broker.corretor} className="border border-gray-300 rounded-lg overflow-hidden">
                            {/* Cabeçalho do corretor */}
                            <button
                                onClick={() => toggleExpand(index)}
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-blue-50 hover:bg-blue-100 transition-colors flex justify-between items-center"
                            >
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <span className="font-semibold text-gray-800 text-sm sm:text-base">{broker.corretor}</span>
                                    <span className="px-2 sm:px-3 py-1 bg-blue-600 text-white rounded-full text-xs sm:text-sm font-medium">
                                        {broker.totalLeads} {broker.totalLeads === 1 ? 'lead' : 'leads'}
                                    </span>
                                </div>
                                <svg
                                    className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${broker.isExpanded ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Lista de leads expandida */}
                            {broker.isExpanded && (
                                <div className="bg-white overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-semibold text-gray-700">Cliente</th>
                                                <th className="px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-semibold text-gray-700">Telefone</th>
                                                <th className="px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-semibold text-gray-700">Data</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {broker.leads.map((lead) => (
                                                <tr key={lead.id} className="border-t border-gray-200 hover:bg-gray-50">
                                                    <td className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-800">{lead.nomeCliente}</td>
                                                    <td className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600">{lead.telefoneCliente}</td>
                                                    <td className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-500">
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
                <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
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
            </ChartContainer>
        </div>
    );
};

export default BrokerLeadsDetailChart;
