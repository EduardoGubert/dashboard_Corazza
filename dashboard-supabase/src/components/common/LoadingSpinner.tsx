import React from 'react';

interface LoadingSpinnerProps {
    message?: string;
    color?: 'blue' | 'purple' | 'teal' | 'red' | 'green';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
    message = 'Carregando dados...', 
    color = 'blue' 
}) => {
    const colorClasses = {
        blue: 'border-blue-500',
        purple: 'border-purple-500',
        teal: 'border-teal-500',
        red: 'border-red-500',
        green: 'border-green-500',
    };

    return (
        <div className="flex items-center justify-center h-64">
            <div className="text-center">
                <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${colorClasses[color]} mx-auto`} />
                <p className="mt-2 text-gray-600 text-sm">{message}</p>
            </div>
        </div>
    );
};

export default LoadingSpinner;
