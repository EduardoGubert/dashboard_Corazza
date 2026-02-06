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

const LeadsChart: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const periodFilter = usePeriodFilter();
    const empreendimentoFilter = useEmpreendimentoFilter();

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

            let query = supabase
                .from('Cadastro_Clientes')
                .select('created_at')
                .order('created_at', { ascending: true });

            query = applyDashboardFilters(query, {
                dateRange: periodFilter.dateRange,
                empreendimento: empreendimentoFilter.selectedEmpreendimento,
            });

            const { data, error } = await query;

            if (error) {
                setError(error.message);
                return;
            }

            if (!data || data.length === 0) {
                setChartData({
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
                return;
            }

            const dateMap = groupByDate(data);
            const sortedDates = sortDates(Object.keys(dateMap));
            const accumulatedValues = calculateAccumulated(dateMap, sortedDates);

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
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchLeadsData();

        const channel = supabase
            .channel('leads-changes')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Cadastro_Clientes' }, () => {
                void fetchLeadsData();
            })
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
                title: { display: true, text: 'Data' },
                ticks: { maxRotation: 45, minRotation: 45 },
            },
            y: {
                title: { display: true, text: 'Total Acumulado de Leads' },
                beginAtZero: true,
                ticks: { stepSize: 1 },
            },
        },
        plugins: {
            legend: { display: true, position: 'top' as const },
            title: { display: true, text: 'Evolução de Leads (Acumulado)' },
            tooltip: {
                callbacks: {
                    label: (context: any) => `Total acumulado: ${context.parsed.y} leads`,
                },
            },
        },
    };

    if (loading) return <LoadingSpinner color="teal" />;
    if (error) return <ErrorMessage message={error} />;

    const accumulatedLeadsData = chartData.datasets[0]?.data as number[];
    const totalLeads =
        accumulatedLeadsData.length > 0
            ? Number(accumulatedLeadsData[accumulatedLeadsData.length - 1]) || 0
            : 0;
    const hasNoData = !chartData.labels || chartData.labels.length === 0;

    return (
        <ChartContainer title="Entrada de Leads ao Longo do Tempo">
            <PeriodSelector {...periodFilter} color="teal" />
            <EmpreendimentoSelector
                selectedEmpreendimento={empreendimentoFilter.selectedEmpreendimento}
                setSelectedEmpreendimento={empreendimentoFilter.setSelectedEmpreendimento}
                empreendimentos={empreendimentoFilter.empreendimentos}
                loading={empreendimentoFilter.isLoadingEmpreendimentos}
                color="teal"
            />

            {empreendimentoFilter.empreendimentoError && (
                <p className="mt-2 text-xs sm:text-sm text-red-600">
                    Erro ao carregar empreendimentos: {empreendimentoFilter.empreendimentoError}
                </p>
            )}

            <div className="w-full h-72 sm:h-80 md:h-96 mt-4">
                <Line data={chartData} options={options} />
            </div>

            <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600">
                <p>
                    <strong>Total de leads no período:</strong>{' '}
                    {totalLeads}
                </p>
                {hasNoData && <p className="mt-1 text-gray-500">Nenhum lead encontrado para os filtros selecionados.</p>}
            </div>
        </ChartContainer>
    );
};

export default LeadsChart;
