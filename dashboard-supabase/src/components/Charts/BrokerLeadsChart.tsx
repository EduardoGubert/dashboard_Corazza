import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { Bar } from 'react-chartjs-2';
import { ChartData, ChartOptions } from 'chart.js';

interface BrokerData {
    corretor_responsavel: string;
    count: number;
}

const BrokerLeadsChart: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [period, setPeriod] = useState<'7days' | '30days' | '90days' | 'all' | 'custom'>('all');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [data, setData] = useState<ChartData<'bar'>>({
        labels: [],
        datasets: [
            {
                label: 'Leads por Corretor',
                data: [],
                backgroundColor: 'rgba(99, 255, 107, 0.6)',
                borderColor: 'rgba(99, 255, 99, 1)',
                borderWidth: 1,
            },
        ],
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            //console.log('📊 Buscando dados de corretores...');
            
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
                .select('corretor_responsavel, created_at')
                .not('corretor_responsavel', 'is', null);

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

            //console.log('✅ Dados recebidos:', leadsData);

            // Agrupar dados manualmente, filtrando valores vazios
            const grouped = leadsData?.reduce((acc: Record<string, number>, item: any) => {
                const corretor = item.corretor_responsavel;
                
                // Ignora valores vazios, null, undefined ou strings vazias
                if (!corretor || corretor.trim() === '') {
                    return acc;
                }
                
                if (!acc[corretor]) {
                    acc[corretor] = 0;
                }
                acc[corretor]++;
                return acc;
            }, {});

            const brokerData: BrokerData[] = Object.entries(grouped || {})
                .map(([corretor_responsavel, count]) => ({
                    corretor_responsavel,
                    count: count as number
                }))
                .sort((a, b) => b.count - a.count); // Ordenar por quantidade (maior para menor)

            const labels = brokerData.map((item: BrokerData) => item.corretor_responsavel);
            const counts = brokerData.map((item: BrokerData) => item.count);

            //console.log('📈 Labels:', labels);
            //console.log('📈 Counts:', counts);

            setData({
                labels,
                datasets: [
                    {
                        label: 'Leads por Corretor',
                        data: counts,
                        backgroundColor: 'rgba(125, 255, 99, 0.6)',
                        borderColor: 'rgba(117, 255, 99, 1)',
                        borderWidth: 1,
                    },
                ],
            });
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
            .channel('broker-leads-changes')
            .on('postgres_changes', 
                { event: 'INSERT', schema: 'public', table: 'Cadastro_Clientes' },
                () => {
                    console.log('🔄 Novo lead inserido, atualizando gráfico de corretores...');
                    fetchData();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [period, customStartDate, customEndDate]);

    const options: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: true,
        indexAxis: 'y', // Barras horizontais para melhor visualização de nomes
        scales: {
            x: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                },
                title: {
                    display: true,
                    text: 'Quantidade de Leads'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Corretor'
                }
            }
        },
        plugins: {
            legend: {
                display: true,
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Leads por Corretor Responsável'
            },
            tooltip: {
                callbacks: {
                    label: function(context: any) {
                        return `${context.parsed.x} leads`;
                    }
                }
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
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
                <h2 className="text-xl font-semibold text-gray-700 mb-3">Quantidade de Leads por Corretor</h2>
                
                {/* Seletor de Período */}
                <div className="flex flex-wrap gap-2 items-center">
                    <button
                        onClick={() => setPeriod('7days')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            period === '7days' 
                                ? 'bg-red-600 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        7 dias
                    </button>
                    <button
                        onClick={() => setPeriod('30days')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            period === '30days' 
                                ? 'bg-red-600 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        30 dias
                    </button>
                    <button
                        onClick={() => setPeriod('90days')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            period === '90days' 
                                ? 'bg-red-600 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        90 dias
                    </button>
                    <button
                        onClick={() => setPeriod('all')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            period === 'all' 
                                ? 'bg-red-600 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Tudo
                    </button>
                    <button
                        onClick={() => setPeriod('custom')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            period === 'custom' 
                                ? 'bg-red-600 text-white' 
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
                                className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">Até:</label>
                            <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
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
            
            <Bar data={data} options={options} />
            
            {/* Informação adicional */}
            <div className="mt-4 text-sm text-gray-600">
                <p>
                    <strong>Total de corretores ativos:</strong> {data.labels?.length || 0}
                </p>
            </div>
        </div>
    );
};

export default BrokerLeadsChart;
