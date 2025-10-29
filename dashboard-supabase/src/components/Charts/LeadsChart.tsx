import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { supabase } from '../../services/supabase';
import { ChartData, ChartOptions } from 'chart.js';

interface LeadData {
    created_at: string;
}

const LeadsChart: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [period, setPeriod] = useState<'7days' | '30days' | '90days' | 'all' | 'custom'>('all');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [chartData, setChartData] = useState<ChartData<'line'>>({
        labels: [],
        datasets: [
            {
                label: 'Leads Acumulados',
                data: [],
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
            },
        ],
    });

    const fetchLeadsData = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('📊 Buscando dados de leads...');
            
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

            // Buscar leads por data de criação
            let query = supabase
                .from('Cadastro_Clientes')
                .select('created_at')
                .order('created_at', { ascending: true });

            // Aplicar filtro de data se necessário
            if (startDate) {
                query = query.gte('created_at', startDate.toISOString());
            }
            if (endDate) {
                query = query.lte('created_at', endDate.toISOString());
            }

            const { data, error } = await query;

            if (error) {
                console.error('❌ Erro ao buscar dados de Leads:', error);
                setError(error.message);
                return;
            }

            console.log('✅ Dados recebidos:', data);
            console.log('📊 Total de registros:', data?.length);

            if (!data || data.length === 0) {
                setChartData({
                    labels: [],
                    datasets: [{
                        label: 'Leads Acumulados',
                        data: [],
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        fill: true,
                    }],
                });
                return;
            }

            // Agrupar leads por data
            const dateMap: Record<string, number> = {};
            
            data.forEach((lead: any) => {
                const date = new Date(lead.created_at).toLocaleDateString('pt-BR');
                dateMap[date] = (dateMap[date] || 0) + 1;  // Conta cada lead
            });

            console.log('📅 Leads por data:', dateMap);

            // Ordenar as datas
            const sortedDates = Object.keys(dateMap).sort((a, b) => {
                const [dayA, monthA, yearA] = a.split('/').map(Number);
                const [dayB, monthB, yearB] = b.split('/').map(Number);
                return new Date(yearA, monthA - 1, dayA).getTime() - new Date(yearB, monthB - 1, dayB).getTime();
            });

            // Calcular valores acumulados
            let accumulated = 0;
            const accumulatedValues = sortedDates.map(date => {
                accumulated += dateMap[date];
                return accumulated;
            });

            console.log('📈 Datas:', sortedDates);
            console.log('📈 Valores por data:', sortedDates.map(d => dateMap[d]));
            console.log('📈 Valores acumulados:', accumulatedValues);
            console.log('🎯 Total final de leads:', accumulated);

            setChartData({
                labels: sortedDates,
                datasets: [
                    {
                        label: 'Leads Acumulados',
                        data: accumulatedValues,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6,
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
        fetchLeadsData();

        // Realtime subscription com nova sintaxe do Supabase v2
        const channel = supabase
            .channel('leads-changes')
            .on('postgres_changes', 
                { event: 'INSERT', schema: 'public', table: 'Cadastro_Clientes' },
                () => {
                    console.log('🔄 Novo lead inserido, atualizando gráfico...');
                    fetchLeadsData();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [period, customStartDate, customEndDate]); // Recarrega quando o período muda

    const options: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false, // 👈 Mudança aqui: false para ter altura fixa
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Data',
                },
                ticks: {
                    maxRotation: 45,
                    minRotation: 45
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Total Acumulado de Leads',
                },
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            },
        },
        plugins: {
            legend: {
                display: true,
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Evolução de Leads (Acumulado)'
            },
            tooltip: {
                callbacks: {
                    label: function(context: any) {
                        return `Total acumulado: ${context.parsed.y} leads`;
                    }
                }
            }
        }
    };

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
                <h2 className="text-xl font-semibold text-gray-700 mb-3">Entrada de Leads ao Longo do Tempo</h2>
                
                {/* Seletor de Período */}
                <div className="flex flex-wrap gap-2 items-center">
                    <button
                        onClick={() => setPeriod('7days')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            period === '7days' 
                                ? 'bg-teal-600 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        7 dias
                    </button>
                    <button
                        onClick={() => setPeriod('30days')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            period === '30days' 
                                ? 'bg-teal-600 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        30 dias
                    </button>
                    <button
                        onClick={() => setPeriod('90days')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            period === '90days' 
                                ? 'bg-teal-600 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        90 dias
                    </button>
                    <button
                        onClick={() => setPeriod('all')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            period === 'all' 
                                ? 'bg-teal-600 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Tudo
                    </button>
                    <button
                        onClick={() => setPeriod('custom')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            period === 'custom' 
                                ? 'bg-teal-600 text-white' 
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
                                className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">Até:</label>
                            <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
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
            
            {/* 👇 ALTURA RESPONSIVA AQUI */}
            <div className="h-64 sm:h-80 md:h-96">
                <Line data={chartData} options={options} />
            </div>
            
            {/* Informação adicional */}
            <div className="mt-4 text-sm text-gray-600">
                <p>
                    <strong>Total de leads no período:</strong> {' '}
                    {chartData.datasets[0].data.length > 0 
                        ? Number(chartData.datasets[0].data[chartData.datasets[0].data.length - 1]) || 0
                        : 0}
                </p>
            </div>
        </div>
    );
};

export default LeadsChart;