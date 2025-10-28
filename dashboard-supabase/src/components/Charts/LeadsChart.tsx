import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { supabase } from '../../services/supabase';
import { ChartData, ChartOptions } from 'chart.js';

const LeadsChart: React.FC = () => {
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
        const { data, error } = await supabase
            .from('Cadastro_Clientes')
            .select('empreendimento, count(*)')
            .group('empreendimento');

        if (error) {
            console.error('Erro ao buscar dados de Leads:', error);
            return;
        }

        const labels = data?.map((item) => item.empreendimento) || [];
        const values = data?.map((item) => item.count) || [];

        setChartData({
            labels,
            datasets: [
                {
                    label: 'Leads por Empreendimento',
                    data: values,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true,
                },
            ],
        });
    };

    useEffect(() => {
        fetchLeadsData();

        const subscription = supabase
            .from('Cadastro_Clientes')
            .on('INSERT', () => {
                fetchLeadsData();
            })
            .subscribe();

        return () => {
            supabase.removeSubscription(subscription);
        };
    }, []);

    const options: ChartOptions<'line'> = {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <div>
            <h2>Leads por Empreendimento</h2>
            <Line data={chartData} options={options} />
        </div>
    );
};

export default LeadsChart;