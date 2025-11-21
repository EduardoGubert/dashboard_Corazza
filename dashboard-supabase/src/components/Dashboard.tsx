import React, { useEffect, useState } from 'react';
import LeadsChart from './Charts/LeadsChart';
import SchedulesChart from './Charts/SchedulesChart';
import BrokerLeadsChart from './Charts/BrokerLeadsChart';
import BrokerLeadsDetailChart from './Charts/BrokerLeadsDetailChart';

const Dashboard: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simular carregamento inicial
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-xl text-gray-700">Carregando Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Cada gráfico em um card */}
            <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6">
                <LeadsChart />
            </div>
            <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6">
                <SchedulesChart />
            </div>
            <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6">
                <BrokerLeadsDetailChart />
            </div>
            <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6">
                <BrokerLeadsChart />
            </div>
        </div>
    );
};

export default Dashboard;