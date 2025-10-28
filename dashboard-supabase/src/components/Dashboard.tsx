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
        <div className="flex min-h-screen bg-gray-100">            
            <div className="flex-1">                
                <div className="p-4">
                    <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white shadow-lg rounded-lg p-6">
                            <LeadsChart />
                        </div>
                        <div className="bg-white shadow-lg rounded-lg p-6">
                            <SchedulesChart />
                        </div>
                        <div className="bg-white shadow-lg rounded-lg p-6">
                            <BrokerLeadsDetailChart />
                        </div>
                        <div className="bg-white shadow-lg rounded-lg p-6">
                            <BrokerLeadsChart />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;