import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { supabase } from '../../services/supabase';
import { ChartData, ChartOptions } from 'chart.js';

interface ScheduleData {
    created_at: string;
    agendamento: number;
}

const SchedulesChart: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [period, setPeriod] = useState<'7days' | '30days' | '90days' | 'all' | 'custom'>('all');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [data, setData] = useState<ChartData<'line'>>({
        labels: [],
        datasets: [
            {
                label: 'Agendamentos Acumulados',
                data: [],
                borderColor: 'rgba(153, 102, 255, 1)',
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                fill: true,
            },
        ],
    });

    const fetchSchedules = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('📊 Buscando dados de agendamentos...');
            
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

            // ✅ CORREÇÃO: Agora busca o campo 'agendamento' também
            let query = supabase
                .from('Cadastro_Clientes')
                .select('created_at, agendamento')  // 👈 MUDANÇA AQUI: busca o campo agendamento
                .not('agendamento', 'is', null)
                .order('created_at', { ascending: true });

            // Aplicar filtro de data se necessário
            if (startDate) {
                query = query.gte('created_at', startDate.toISOString());
            }
            if (endDate) {
                query = query.lte('created_at', endDate.toISOString());
            }

            const { data: schedules, error } = await query;

            if (error) {
                console.error('❌ Error fetching schedules:', error);
                setError(error.message);
                return;
            }

            console.log('✅ Dados recebidos:', schedules);
            console.log('📊 Total de registros:', schedules?.length);

            if (!schedules || schedules.length === 0) {
                setData({
                    labels: [],
                    datasets: [{
                        label: 'Agendamentos Acumulados',
                        data: [],
                        borderColor: 'rgba(153, 102, 255, 1)',
                        backgroundColor: 'rgba(153, 102, 255, 0.2)',
                        fill: true,
                    }],
                });
                return;
            }

            // ✅ CORREÇÃO: Agrupar por data e SOMAR os valores de agendamento
            const dateMap: Record<string, number> = {};
            
            schedules.forEach((schedule: any) => {
                const date = new Date(schedule.created_at).toLocaleDateString('pt-BR');
                const agendamentoValue = Number(schedule.agendamento) || 0;  // 👈 Pega o VALOR do campo
                
                // Soma o VALOR do agendamento, não +1
                dateMap[date] = (dateMap[date] || 0) + agendamentoValue;  // 👈 MUDANÇA AQUI
            });

            console.log('📅 Agendamentos por data:', dateMap);

            // Ordenar as datas
            const sortedDates = Object.keys(dateMap).sort((a, b) => {
                const [dayA, monthA, yearA] = a.split('/').map(Number);
                const [dayB, monthB, yearB] = b.split('/').map(Number);
                return new Date(yearA, monthA - 1, dayA).getTime() - new Date(yearB, monthB - 1, dayB).getTime();
            });

            // Calcular valores acumulados
            let accumulated = 0;
            const accumulatedValues = sortedDates.map(date => {
                accumulated += dateMap[date];  // Agora soma o VALOR CORRETO
                return accumulated;
            });

            console.log('📈 Datas:', sortedDates);
            console.log('📈 Valores por data:', sortedDates.map(d => dateMap[d]));
            console.log('📈 Valores acumulados:', accumulatedValues);
            console.log('🎯 Total final de agendamentos:', accumulated);

            setData({
                labels: sortedDates,
                datasets: [
                    {
                        label: 'Agendamentos Acumulados',
                        data: accumulatedValues,
                        borderColor: 'rgba(153, 102, 255, 1)',
                        backgroundColor: 'rgba(153, 102, 255, 0.2)',
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
        fetchSchedules();

        // Realtime subscription com nova sintaxe do Supabase v2
        const channel = supabase
            .channel('schedules-changes')
            .on('postgres_changes', 
                { event: 'INSERT', schema: 'public', table: 'Cadastro_Clientes' },
                () => {
                    console.log('🔄 Novo agendamento inserido, atualizando gráfico...');
                    fetchSchedules();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [period, customStartDate, customEndDate]); // Recarrega quando o período muda

    const options: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: true,
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
                    text: 'Total Acumulado de Agendamentos',
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
                text: 'Evolução de Agendamentos (Acumulado)'
            },
            tooltip: {
                callbacks: {
                    label: function(context: any) {
                        return `Total acumulado: ${context.parsed.y} agendamentos`;
                    }
                }
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
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
                <h2 className="text-xl font-semibold text-gray-700 mb-3">Agendamentos ao Longo do Tempo</h2>
                
                {/* Seletor de Período */}
                <div className="flex flex-wrap gap-2 items-center">
                    <button
                        onClick={() => setPeriod('7days')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            period === '7days' 
                                ? 'bg-purple-600 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        7 dias
                    </button>
                    <button
                        onClick={() => setPeriod('30days')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            period === '30days' 
                                ? 'bg-purple-600 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        30 dias
                    </button>
                    <button
                        onClick={() => setPeriod('90days')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            period === '90days' 
                                ? 'bg-purple-600 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        90 dias
                    </button>
                    <button
                        onClick={() => setPeriod('all')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            period === 'all' 
                                ? 'bg-purple-600 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Tudo
                    </button>
                    <button
                        onClick={() => setPeriod('custom')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            period === 'custom' 
                                ? 'bg-purple-600 text-white' 
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
                                className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">Até:</label>
                            <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            
            <Line data={data} options={options} />
            
            {/* Informação adicional */}
            <div className="mt-4 text-sm text-gray-600">
                <p>
                    <strong>Total de agendamentos no período:</strong> {' '}
                    {data.datasets[0].data.length > 0 
                        ? Number(data.datasets[0].data[data.datasets[0].data.length - 1]) || 0
                        : 0}
                </p>
            </div>
        </div>
    );
};

export default SchedulesChart;