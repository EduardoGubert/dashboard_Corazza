import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { supabase } from '../../services/supabase';
import { ChartData, ChartOptions } from 'chart.js';
import { usePeriodFilter } from '../../hooks/usePeriodFilter';
import PeriodSelector from '../common/PeriodSelector';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import ChartContainer from '../common/ChartContainer';
import { applyDateFilter, groupByDate, sortDates, calculateAccumulated } from '../../utils/supabaseHelpers';

interface ScheduleData {
    created_at: string;
    agendamento: number;
}

const SchedulesChart: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // ✅ Hook centralizado para gerenciar o filtro de período
    const periodFilter = usePeriodFilter();
    
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
            
            // ✅ Utiliza função centralizada para aplicar filtro de data
            let query = supabase
                .from('Cadastro_Clientes')
                .select('created_at, agendamento')
                .not('agendamento', 'is', null)
                .order('created_at', { ascending: true });

            query = applyDateFilter(query, periodFilter.dateRange);

            const { data: schedules, error } = await query;

            if (error) {
                console.error('❌ Error fetching schedules:', error);
                setError(error.message);
                return;
            }

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

            // ✅ Utiliza função centralizada para agrupar por data e somar valores
            const dateMap = groupByDate(schedules, (item: any) => Number(item.agendamento) || 0);
           
            // ✅ Utiliza função centralizada para ordenar datas
            const sortedDates = sortDates(Object.keys(dateMap));

            // ✅ Utiliza função centralizada para calcular acumulado
            const accumulatedValues = calculateAccumulated(dateMap, sortedDates);

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
                    fetchSchedules();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [periodFilter.dateRange]); // ✅ Depende apenas do dateRange calculado

    const options: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
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

    // ✅ Componente reutilizável para loading
    if (loading) {
        return <LoadingSpinner color="purple" />;
    }

    // ✅ Componente reutilizável para erro
    if (error) {
        return <ErrorMessage message={error} />;
    }

    return (
        <div className="w-full">
            {/* ✅ Componente reutilizável para título */}
            <ChartContainer title="Agendamentos ao Longo do Tempo">
                {/* ✅ Componente reutilizável para seletor de período */}
                <PeriodSelector {...periodFilter} color="purple" />
                
                {/* Gráfico com altura responsiva */}
                <div className="h-72 sm:h-80 md:h-96">
                    <Line data={data} options={options} />
                </div>
                
                {/* Informação adicional */}
                <div className="mt-4 text-xs sm:text-sm text-gray-600">
                    <p>
                        <strong>Total de agendamentos no período:</strong> {' '}
                        {data.datasets[0].data.length > 0 
                            ? Number(data.datasets[0].data[data.datasets[0].data.length - 1]) || 0
                            : 0}
                    </p>
                </div>
            </ChartContainer>
        </div>
    );
};

export default SchedulesChart;