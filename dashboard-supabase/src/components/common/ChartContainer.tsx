import React from 'react';

interface ChartContainerProps {
    title: string;
    children: React.ReactNode;
}

const ChartContainer: React.FC<ChartContainerProps> = ({ title, children }) => {
    return (
        <div className="w-full">
            <div className="mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2 sm:mb-3">
                    {title}
                </h2>
                {children}
            </div>
        </div>
    );
};

export default ChartContainer;
