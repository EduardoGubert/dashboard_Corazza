import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { supabase } from '../../services/supabase';
import { ChartData, ChartOptions } from 'chart.js';

interface LeadData {
    empreendimento: string;
    count: number;
}

const LeadsChart: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [chartData, setChartData] = useState<ChartData<'line'>>({
        labels: [],
        datasets: [
            {
                label: 'Leads por Empreendimento',
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
            
            const { data, error } = await supabase
                .from('Cadastro_Clientes')
                .select('empreendimento');

            if (error) {
                console.error('❌ Erro ao buscar dados de Leads:', error);
                setError(error.message);
                return;
            }

            console.log('✅ Dados recebidos:', data);

            // Agrupar dados manualmente
            const grouped = data?.reduce((acc: Record<string, number>, item: any) => {
                const empreendimento = item.empreendimento || 'Sem Empreendimento';
                if (!acc[empreendimento]) {
                    acc[empreendimento] = 0;
                }
                acc[empreendimento]++;
                return acc;
            }, {});

            const leadsData: LeadData[] = Object.entries(grouped || {}).map(([empreendimento, count]) => ({
                empreendimento,
                count: count as number
            }));

            const labels = leadsData.map((item: LeadData) => item.empreendimento);
            const values = leadsData.map((item: LeadData) => item.count);

            console.log('📈 Labels:', labels);
            console.log('📈 Values:', values);

            setChartData({
                labels,
                datasets: [
                    {
                        label: 'Leads por Empreendimento',
                        data: values,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        fill: true,
                        tension: 0.4,
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
    }, []);

    const options: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            y: {
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
                text: 'Leads por Empreendimento'
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
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Leads por Empreendimento</h2>
            <Line data={chartData} options={options} />
        </div>
    );
};

export default LeadsChart;