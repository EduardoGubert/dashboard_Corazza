import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { Bar } from 'react-chartjs-2';
import { ChartData, ChartOptions } from 'chart.js';
import { usePeriodFilter } from '../../hooks/usePeriodFilter';
import PeriodSelector from '../common/PeriodSelector';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import ChartContainer from '../common/ChartContainer';
import { applyDateFilter } from '../../utils/supabaseHelpers';

interface BrokerData {
    corretor_responsavel: string;
    count: number;
}

const BrokerLeadsChart: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // ✅ Hook centralizado para gerenciar o filtro de período
    const periodFilter = usePeriodFilter();
    
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
            
            // ✅ Utiliza função centralizada para aplicar filtro de data
            let query = supabase
                .from('Cadastro_Clientes')
                .select('corretor_responsavel, created_at')
                .not('corretor_responsavel', 'is', null);

            query = applyDateFilter(query, periodFilter.dateRange);

            const { data: leadsData, error } = await query;

            if (error) {
                console.error('❌ Error fetching data:', error);
                setError(error.message);
                return;
            }

            // ✅ Agrupar dados manualmente, filtrando valores vazios
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
    }, [periodFilter.dateRange]); // ✅ Depende apenas do dateRange calculado

    const options: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
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

    // ✅ Componente reutilizável para loading
    if (loading) {
        return <LoadingSpinner color="green" />;
    }

    // ✅ Componente reutilizável para erro
    if (error) {
        return <ErrorMessage message={error} />;
    }

    return (
        <div className="w-full">
            {/* ✅ Componente reutilizável para título */}
            <ChartContainer title="Quantidade de Leads por Corretor">
                {/* ✅ Componente reutilizável para seletor de período */}
                <PeriodSelector {...periodFilter} color="green" />
                
                {/* Gráfico com altura responsiva */}
                <div className="h-72 sm:h-80 md:h-96">
                    <Bar data={data} options={options} />
                </div>
                
                {/* Informação adicional */}
                <div className="mt-4 text-xs sm:text-sm text-gray-600">
                    <p>
                        <strong>Total de corretores ativos:</strong> {data.labels?.length || 0}
                    </p>
                </div>
            </ChartContainer>
        </div>
    );
};

export default BrokerLeadsChart;
