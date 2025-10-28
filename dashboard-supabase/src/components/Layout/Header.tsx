import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="bg-blue-600 text-white p-4">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <nav>
                <ul className="flex space-x-4">
                    <li><a href="#" className="hover:underline">Home</a></li>
                    <li><a href="#" className="hover:underline">Leads</a></li>
                    <li><a href="#" className="hover:underline">Agendamentos</a></li>
                    <li><a href="#" className="hover:underline">Corretores</a></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;