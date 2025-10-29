import React, { useEffect, useState } from 'react';
import LeadsChart from './Charts/LeadsChart';
import SchedulesChart from './Charts/SchedulesChart';
import BrokerLeadsChart from './Charts/BrokerLeadsChart';
import BrokerLeadsDetailChart from './Charts/BrokerLeadsDetailChart';

const Dashboard: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        console.log('✅ Dashboard montado');
        // Simular carregamento inicial
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-xl text-gray-700">Carregando Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">            
            <div className="w-full">                
                <div className="p-3 sm:p-4 md:p-6">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-800">Dashboard Corazza</h1>
                    
                    {/* Grid responsivo - 1 coluna no mobile, 2 no desktop */}
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
                </div>
            </div>
        </div>
    );
};

export default Dashboard;