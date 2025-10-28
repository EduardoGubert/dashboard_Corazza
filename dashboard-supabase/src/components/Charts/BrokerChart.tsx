import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BrokerChart = () => {
    const [data, setData] = useState({ labels: [], datasets: [] });

    useEffect(() => {
        const fetchData = async () => {
            const { data: leadsData, error } = await supabase
                .from('Cadastro_Clientes')
                .select('corretor_responsavel, count(*)')
                .group('corretor_responsavel');

            if (error) {
                console.error('Error fetching data:', error);
                return;
            }

            const labels = leadsData.map(item => item.corretor_responsavel);
            const counts = leadsData.map(item => item.count);

            setData({
                labels,
                datasets: [
                    {
                        label: 'Leads por Corretor',
                        data: counts,
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    },
                ],
            });
        };

        fetchData();

        const subscription = supabase
            .from('Cadastro_Clientes')
            .on('INSERT', fetchData)
            .subscribe();

        return () => {
            supabase.removeSubscription(subscription);
        };
    }, []);

    return (
        <div>
            <h2>Contagem de Leads por Corretor</h2>
            <Bar data={data} />
        </div>
    );
};

export default BrokerChart;