import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { supabase } from '../../services/supabase';
import { ChartData, ChartOptions } from 'chart.js';
import { usePeriodFilter } from '../../hooks/usePeriodFilter';
import { useEmpreendimentoFilter } from '../../hooks/useEmpreendimentoFilter';
import PeriodSelector from '../common/PeriodSelector';
import EmpreendimentoSelector from '../common/EmpreendimentoSelector';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import ChartContainer from '../common/ChartContainer';
import { applyDashboardFilters, groupByDate, sortDates, calculateAccumulated } from '../../utils/supabaseHelpers';

interface ScheduleItem {
    created_at: string;
    agendamento: number | null;
}

const SchedulesChart: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // ✅ Hook centralizado para gerenciar o filtro de período
    const periodFilter = usePeriodFilter();
    const empreendimentoFilter = useEmpreendimentoFilter();
    
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

            query = applyDashboardFilters(query, {
                dateRange: periodFilter.dateRange,
                empreendimento: empreendimentoFilter.selectedEmpreendimento,
            });

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
            const dateMap = groupByDate(schedules as ScheduleItem[], (item) => Number(item.agendamento) || 0);
           
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
        void fetchSchedules();

        // Realtime subscription com nova sintaxe do Supabase v2
        const channel = supabase
            .channel('schedules-changes')
            .on('postgres_changes', 
                { event: 'INSERT', schema: 'public', table: 'Cadastro_Clientes' },
                () => {
                    void fetchSchedules();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [periodFilter.dateRange, empreendimentoFilter.selectedEmpreendimento]);

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

    const accumulatedSchedulesData = data.datasets[0]?.data as number[];
    const totalSchedules =
        accumulatedSchedulesData.length > 0
            ? Number(accumulatedSchedulesData[accumulatedSchedulesData.length - 1]) || 0
            : 0;
    const hasNoData = !data.labels || data.labels.length === 0;

    return (
        <div className="w-full">
            {/* ✅ Componente reutilizável para título */}
            <ChartContainer title="Agendamentos ao Longo do Tempo">
                {/* ✅ Componente reutilizável para seletor de período */}
                <PeriodSelector {...periodFilter} color="purple" />
                <EmpreendimentoSelector
                    selectedEmpreendimento={empreendimentoFilter.selectedEmpreendimento}
                    setSelectedEmpreendimento={empreendimentoFilter.setSelectedEmpreendimento}
                    empreendimentos={empreendimentoFilter.empreendimentos}
                    loading={empreendimentoFilter.isLoadingEmpreendimentos}
                    color="purple"
                />

                {empreendimentoFilter.empreendimentoError && (
                    <p className="mt-2 text-xs sm:text-sm text-red-600">
                        Erro ao carregar empreendimentos: {empreendimentoFilter.empreendimentoError}
                    </p>
                )}
                
                {/* Gráfico com altura responsiva */}
                <div className="h-72 sm:h-80 md:h-96">
                    <Line data={data} options={options} />
                </div>
                
                {/* Informação adicional */}
                <div className="mt-4 text-xs sm:text-sm text-gray-600">
                    <p>
                        <strong>Total de agendamentos no período:</strong> {' '}
                        {totalSchedules}
                    </p>
                    {hasNoData && (
                        <p className="mt-1 text-gray-500">
                            Nenhum agendamento encontrado para os filtros selecionados.
                        </p>
                    )}
                </div>
            </ChartContainer>
        </div>
    );
};

export default SchedulesChart;
