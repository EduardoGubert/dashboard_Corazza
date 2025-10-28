import React from 'react';

const Sidebar: React.FC = () => {
    return (
        <div className="sidebar">
            <h2>Dashboard</h2>
            <ul>
                <li><a href="#leads">Leads</a></li>
                <li><a href="#schedules">Agendamentos</a></li>
                <li><a href="#brokers">Corretores</a></li>
            </ul>
        </div>
    );
};

export default Sidebar;