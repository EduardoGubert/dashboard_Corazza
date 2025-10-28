import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { Bar } from 'react-chartjs-2';
import { ChartData, ChartOptions } from 'chart.js';

interface BrokerData {
    corretor_responsavel: string;
    count: number;
}

const BrokerChart: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<ChartData<'bar'>>({
        labels: [],
        datasets: [
            {
                label: 'Leads por Corretor',
                data: [],
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                console.log('📊 Buscando dados de corretores...');
                
                const { data: leadsData, error } = await supabase
                    .from('Cadastro_Clientes')
                    .select('corretor_responsavel')
                    .not('corretor_responsavel', 'is', null);

                if (error) {
                    console.error('❌ Error fetching data:', error);
                    setError(error.message);
                    return;
                }

                console.log('✅ Dados recebidos:', leadsData);

                // Agrupar dados manualmente
                const grouped = leadsData?.reduce((acc: Record<string, number>, item: any) => {
                    const corretor = item.corretor_responsavel || 'Sem Corretor';
                    if (!acc[corretor]) {
                        acc[corretor] = 0;
                    }
                    acc[corretor]++;
                    return acc;
                }, {});

                const brokerData: BrokerData[] = Object.entries(grouped || {}).map(([corretor_responsavel, count]) => ({
                    corretor_responsavel,
                    count: count as number
                }));

                const labels = brokerData.map((item: BrokerData) => item.corretor_responsavel);
                const counts = brokerData.map((item: BrokerData) => item.count);

                console.log('📈 Labels:', labels);
                console.log('📈 Counts:', counts);

                setData({
                    labels,
                    datasets: [
                        {
                            label: 'Leads por Corretor',
                            data: counts,
                            backgroundColor: 'rgba(75, 192, 192, 0.6)',
                            borderColor: 'rgba(75, 192, 192, 1)',
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

        fetchData();

        // Realtime subscription com nova sintaxe do Supabase v2
        const channel = supabase
            .channel('broker-changes')
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
    }, []);

    const options: ChartOptions<'bar'> = {
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
                text: 'Leads por Corretor Responsável'
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
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Contagem de Leads por Corretor</h2>
            <Bar data={data} options={options} />
        </div>
    );
};

export default BrokerChart;