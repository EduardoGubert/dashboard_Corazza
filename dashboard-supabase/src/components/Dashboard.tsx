import React from 'react';
import Header from './Layout/Header';
import Sidebar from './Layout/Sidebar';
import LeadsChart from './Charts/LeadsChart';
import SchedulesChart from './Charts/SchedulesChart';
import BrokerChart from './Charts/BrokerChart';

const Dashboard: React.FC = () => {
    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-1">
                <Header />
                <div className="p-4">
                    <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white shadow rounded-lg p-4">
                            <LeadsChart />
                        </div>
                        <div className="bg-white shadow rounded-lg p-4">
                            <SchedulesChart />
                        </div>
                        <div className="bg-white shadow rounded-lg p-4 col-span-1 md:col-span-2">
                            <BrokerChart />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;