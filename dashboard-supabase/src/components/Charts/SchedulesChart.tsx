import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { supabase } from '../../services/supabase';
import { ChartData, ChartOptions } from 'chart.js';

const SchedulesChart: React.FC = () => {
    const [data, setData] = useState<ChartData<'line'>>({
        labels: [],
        datasets: [
            {
                label: 'Agendamentos',
                data: [],
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
            },
        ],
    });

    const fetchSchedules = async () => {
        const { data: schedules, error } = await supabase
            .from('Cadastro_Clientes')
            .select('agendamentos, created_at')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching schedules:', error);
            return;
        }

        const labels = schedules?.map(schedule => new Date(schedule.created_at).toLocaleString());
        const values = schedules?.map(schedule => schedule.agendamentos);

        setData({
            labels: labels || [],
            datasets: [
                {
                    label: 'Agendamentos',
                    data: values || [],
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true,
                },
            ],
        });
    };

    useEffect(() => {
        fetchSchedules();

        const subscription = supabase
            .from('Cadastro_Clientes')
            .on('INSERT', () => {
                fetchSchedules();
            })
            .subscribe();

        return () => {
            supabase.removeSubscription(subscription);
        };
    }, []);

    const options: ChartOptions<'line'> = {
        responsive: true,
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Data',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Quantidade de Agendamentos',
                },
            },
        },
    };

    return (
        <div>
            <h2>Agendamentos em Tempo Real</h2>
            <Line data={data} options={options} />
        </div>
    );
};

export default SchedulesChart;