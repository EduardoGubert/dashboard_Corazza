import React from 'react';
import { PeriodType } from '../../hooks/usePeriodFilter';

interface PeriodSelectorProps {
    period: PeriodType;
    setPeriod: (period: PeriodType) => void;
    customStartDate: string;
    setCustomStartDate: (date: string) => void;
    customEndDate: string;
    setCustomEndDate: (date: string) => void;
    daysInRange: number | null;
    color?: 'teal' | 'purple' | 'red' | 'blue' | 'green';
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({
    period,
    setPeriod,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    daysInRange,
    color = 'blue',
}) => {
    const colorClasses = {
        teal: 'bg-teal-600',
        purple: 'bg-purple-600',
        red: 'bg-red-600',
        blue: 'bg-blue-600',
        green: 'bg-green-600',
    };

    const ringClasses = {
        teal: 'focus:ring-teal-500',
        purple: 'focus:ring-purple-500',
        red: 'focus:ring-red-500',
        blue: 'focus:ring-blue-500',
        green: 'focus:ring-green-500',
    };

    const activeClass = `${colorClasses[color]} text-white`;
    const inactiveClass = 'bg-gray-200 text-gray-700 hover:bg-gray-300';
    const ringClass = ringClasses[color];

    return (
        <div>
            {/* Botões de período */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 items-center">
                <button
                    onClick={() => setPeriod('7days')}
                    className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium transition-colors ${
                        period === '7days' ? activeClass : inactiveClass
                    }`}
                >
                    7 dias
                </button>
                <button
                    onClick={() => setPeriod('30days')}
                    className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium transition-colors ${
                        period === '30days' ? activeClass : inactiveClass
                    }`}
                >
                    30 dias
                </button>
                <button
                    onClick={() => setPeriod('90days')}
                    className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium transition-colors ${
                        period === '90days' ? activeClass : inactiveClass
                    }`}
                >
                    90 dias
                </button>
                <button
                    onClick={() => setPeriod('all')}
                    className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium transition-colors ${
                        period === 'all' ? activeClass : inactiveClass
                    }`}
                >
                    Tudo
                </button>
                <button
                    onClick={() => setPeriod('custom')}
                    className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium transition-colors ${
                        period === 'custom' ? activeClass : inactiveClass
                    }`}
                >
                    📅 Personalizado
                </button>
            </div>

            {/* Seletor de data personalizado */}
            {period === 'custom' && (
                <div className="mt-2 sm:mt-3 flex flex-col sm:flex-row gap-2 sm:gap-3 bg-gray-50 p-2 sm:p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                        <label className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                            De:
                        </label>
                        <input
                            type="date"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                            className={`flex-1 px-2 sm:px-3 py-1 border border-gray-300 rounded text-xs sm:text-sm focus:outline-none focus:ring-2 ${ringClass}`}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                            Até:
                        </label>
                        <input
                            type="date"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                            className={`flex-1 px-2 sm:px-3 py-1 border border-gray-300 rounded text-xs sm:text-sm focus:outline-none focus:ring-2 ${ringClass}`}
                        />
                    </div>
                    {daysInRange && (
                        <span className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                            ({daysInRange} dias)
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export default PeriodSelector;
