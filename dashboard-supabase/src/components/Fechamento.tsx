import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { usePeriodFilter } from '../hooks/usePeriodFilter';
import PeriodSelector from './common/PeriodSelector';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';
import ChartContainer from './common/ChartContainer';
import { applyDateFilter } from '../utils/supabaseHelpers';
import { useAuth } from '../contexts/AuthContext';

interface Lead {
    id: number;
    nomeCliente: string;
    telefoneCliente: string;
    corretor_responsavel: string;
    created_at: string;
    data_agendamento: string | null;
    fechado: boolean;
    usuario_fechou: string | null;
    dataFechamento: string | null;
    DataAtualizacao: string | null;
}

interface BrokerLeadsDetail {
    corretor: string;
    totalLeads: number;
    leads: Lead[];
    isExpanded: boolean;
}

const Fechamento: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState<number | null>(null);
    const { isAdmin, user } = useAuth();
    
    const periodFilter = usePeriodFilter();
    
    const [brokersData, setBrokersData] = useState<BrokerLeadsDetail[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            let query = supabase
                .from('Cadastro_Clientes')
                .select('id, nomeCliente, telefoneCliente, corretor_responsavel, created_at, data_agendamento, fechado, usuario_fechou, dataFechamento, DataAtualizacao')
                .not('corretor_responsavel', 'is', null)
                .order('created_at', { ascending: false });

            query = applyDateFilter(query, periodFilter.dateRange);

            const { data: leadsData, error } = await query;

            if (error) {
                console.error('❌ Error fetching data:', error);
                setError(error.message);
                return;
            }

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
                    created_at: lead.created_at,
                    data_agendamento: lead.data_agendamento || null,
                    fechado: lead.fechado || false,
                    usuario_fechou: lead.usuario_fechou || null,
                    dataFechamento: lead.dataFechamento || null,
                    DataAtualizacao: lead.DataAtualizacao || null
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
            .channel('fechamento-changes')
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
    }, [periodFilter.dateRange]);

    const toggleExpand = (index: number) => {
        setBrokersData(prev => prev.map((broker, i) => 
            i === index ? { ...broker, isExpanded: !broker.isExpanded } : broker
        ));
    };

    const toggleFechado = async (leadId: number, currentStatus: boolean) => {
        if (!isAdmin) {
            alert('Apenas administradores podem marcar fechamentos!');
            return;
        }

        // Se está marcando como fechado, pedir a data
        let dataFechamento: string | null = null;
        if (!currentStatus) {
            const inputData = prompt('Digite a data do fechamento (DD/MM/YYYY):', 
                new Date().toLocaleDateString('pt-BR'));
            
            if (!inputData) {
                return; // Cancelou
            }

            // Converter data de DD/MM/YYYY para YYYY-MM-DD
            const [dia, mes, ano] = inputData.split('/');
            if (!dia || !mes || !ano || ano.length !== 4) {
                alert('Data inválida! Use o formato DD/MM/YYYY');
                return;
            }
            dataFechamento = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
        }

        try {
            setUpdating(leadId);
            
            const agora = new Date().toISOString();
            const { error } = await supabase
                .from('Cadastro_Clientes')
                .update({ 
                    fechado: !currentStatus,
                    usuario_fechou: !currentStatus ? user?.username : null,
                    dataFechamento: !currentStatus ? dataFechamento : null,
                    DataAtualizacao: agora
                })
                .eq('id', leadId);

            if (error) {
                console.error('Erro ao atualizar:', error);
                alert('Erro ao atualizar status de fechamento');
                return;
            }

            // Atualizar estado local
            setBrokersData(prev => prev.map(broker => ({
                ...broker,
                leads: broker.leads.map(lead => 
                    lead.id === leadId ? { 
                        ...lead, 
                        fechado: !currentStatus,
                        usuario_fechou: !currentStatus ? user?.username || null : null,
                        dataFechamento: !currentStatus ? dataFechamento : null,
                        DataAtualizacao: agora
                    } : lead
                )
            })));
        } catch (err) {
            console.error('Erro:', err);
            alert('Erro ao atualizar status');
        } finally {
            setUpdating(null);
        }
    };

    const filteredBrokers = brokersData.filter(broker =>
        broker.corretor.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <LoadingSpinner color="green" />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    const totalFechados = filteredBrokers.reduce((sum, broker) => 
        sum + broker.leads.filter(lead => lead.fechado).length, 0
    );

    const totalLeads = filteredBrokers.reduce((sum, broker) => sum + broker.totalLeads, 0);

    return (
        <div className="w-full">
            <ChartContainer title="Controle de Fechamentos">
                <PeriodSelector {...periodFilter} color="green" />

                {/* Campo de busca */}
                <div className="mb-3 sm:mb-4">
                    <input
                        type="text"
                        placeholder="Buscar corretor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>

                {/* Aviso para não-admin */}
                {!isAdmin && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                            ℹ️ Apenas administradores podem marcar fechamentos
                        </p>
                    </div>
                )}

                {/* Lista de corretores */}
                <div className="space-y-3 max-h-72 sm:max-h-80 md:max-h-96 overflow-y-auto">
                    {filteredBrokers.map((broker, index) => {
                        const fechadosCorretor = broker.leads.filter(l => l.fechado).length;
                        
                        return (
                            <div key={broker.corretor} className="border border-gray-300 rounded-lg overflow-hidden">
                                {/* Cabeçalho do corretor */}
                                <button
                                    onClick={() => toggleExpand(index)}
                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-green-50 hover:bg-green-100 transition-colors flex justify-between items-center"
                                >
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <span className="font-semibold text-gray-800 text-sm sm:text-base">
                                            {broker.corretor}
                                        </span>
                                        <span className="px-2 sm:px-3 py-1 bg-green-600 text-white rounded-full text-xs sm:text-sm font-medium">
                                            {broker.totalLeads} {broker.totalLeads === 1 ? 'lead' : 'leads'}
                                        </span>
                                        {fechadosCorretor > 0 && (
                                            <span className="px-2 sm:px-3 py-1 bg-blue-600 text-white rounded-full text-xs sm:text-sm font-medium">
                                                ✓ {fechadosCorretor} fechado{fechadosCorretor > 1 ? 's' : ''}
                                            </span>
                                        )}
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
                                                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700">Cliente</th>
                                                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700">Telefone</th>
                                                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700">Data Entrada Lead</th>
                                                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700">Data Agendamento</th>
                                                    <th className="px-2 py-2 text-center text-xs font-semibold text-gray-700">Fechado</th>
                                                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700">Usuário</th>
                                                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700">Dt Fechamento</th>
                                                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700">Atualização</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {broker.leads.map((lead) => (
                                                    <tr key={lead.id} className="border-t border-gray-200 hover:bg-gray-50">
                                                        <td className="px-2 py-2 text-xs text-gray-800">
                                                            {lead.nomeCliente}
                                                        </td>
                                                        <td className="px-2 py-2 text-xs text-gray-600">
                                                            {lead.telefoneCliente}
                                                        </td>
                                                        <td className="px-2 py-2 text-xs text-gray-500">
                                                            {new Date(lead.created_at).toLocaleDateString('pt-BR', {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                year: 'numeric'
                                                            })}
                                                        </td>
                                                        <td className="px-2 py-2 text-xs text-gray-500">
                                                            {lead.data_agendamento
                                                                ? new Date(lead.data_agendamento).toLocaleDateString('pt-BR', {
                                                                    day: '2-digit',
                                                                    month: '2-digit',
                                                                    year: 'numeric'
                                                                })
                                                                : ''}
                                                        </td>
                                                        <td className="px-2 py-2 text-center">
                                                            <button
                                                                onClick={() => toggleFechado(lead.id, lead.fechado)}
                                                                disabled={!isAdmin || updating === lead.id}
                                                                className={`
                                                                    inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all
                                                                    ${!isAdmin ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                                                                    ${lead.fechado 
                                                                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                                                                        : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                                                                    }
                                                                    ${updating === lead.id ? 'opacity-50 animate-pulse' : ''}
                                                                `}
                                                                title={isAdmin ? (lead.fechado ? 'Marcar como não fechado' : 'Marcar como fechado') : 'Apenas admin pode alterar'}
                                                            >
                                                                {updating === lead.id ? (
                                                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                    </svg>
                                                                ) : lead.fechado ? (
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                ) : (
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                    </svg>
                                                                )}
                                                            </button>
                                                        </td>
                                                        <td className="px-2 py-2 text-xs text-gray-700 font-medium">
                                                            {lead.usuario_fechou || '-'}
                                                        </td>
                                                        <td className="px-2 py-2 text-xs text-gray-700">
                                                            {lead.dataFechamento ? new Date(lead.dataFechamento).toLocaleDateString('pt-BR') : '-'}
                                                        </td>
                                                        <td className="px-2 py-2 text-xs text-gray-500">
                                                            {lead.DataAtualizacao ? new Date(lead.DataAtualizacao).toLocaleString('pt-BR', {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            }) : '-'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Totais */}
                <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                        <div>
                            <strong className="text-gray-700">Total de corretores:</strong>{' '}
                            <span className="text-gray-900">{filteredBrokers.length}</span>
                        </div>
                        <div>
                            <strong className="text-gray-700">Total de leads:</strong>{' '}
                            <span className="text-gray-900">{totalLeads}</span>
                        </div>
                        <div>
                            <strong className="text-green-700">Fechados:</strong>{' '}
                            <span className="text-green-900 font-bold">
                                {totalFechados} ({totalLeads > 0 ? ((totalFechados / totalLeads) * 100).toFixed(1) : 0}%)
                            </span>
                        </div>
                    </div>
                </div>
            </ChartContainer>
        </div>
    );
};

export default Fechamento;
