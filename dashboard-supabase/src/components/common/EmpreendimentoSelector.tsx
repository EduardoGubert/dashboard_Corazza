import React, { useId } from 'react';

interface EmpreendimentoSelectorProps {
    selectedEmpreendimento: string;
    setSelectedEmpreendimento: (empreendimento: string) => void;
    empreendimentos: string[];
    loading?: boolean;
    color?: 'teal' | 'purple' | 'red' | 'blue' | 'green';
}

const EmpreendimentoSelector: React.FC<EmpreendimentoSelectorProps> = ({
    selectedEmpreendimento,
    setSelectedEmpreendimento,
    empreendimentos,
    loading = false,
    color = 'blue',
}) => {
    const selectId = useId();

    const ringClasses = {
        teal: 'focus:ring-teal-500',
        purple: 'focus:ring-purple-500',
        red: 'focus:ring-red-500',
        blue: 'focus:ring-blue-500',
        green: 'focus:ring-green-500',
    };

    return (
        <div className="mt-2 sm:mt-3 flex items-center gap-2 sm:gap-3">
            <label htmlFor={selectId} className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                Empreendimento:
            </label>
            <select
                id={selectId}
                value={selectedEmpreendimento}
                onChange={(event) => setSelectedEmpreendimento(event.target.value)}
                className={`flex-1 sm:flex-none min-w-0 sm:min-w-64 px-2 sm:px-3 py-1 border border-gray-300 rounded text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 ${ringClasses[color]}`}
                disabled={loading}
            >
                <option value="">Tudo</option>
                {empreendimentos.map((empreendimento) => (
                    <option key={empreendimento} value={empreendimento}>
                        {empreendimento}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default EmpreendimentoSelector;
