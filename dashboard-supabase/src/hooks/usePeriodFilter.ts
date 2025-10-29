import { useState, useMemo } from 'react';

export type PeriodType = '7days' | '30days' | '90days' | 'all' | 'custom';

export interface DateRange {
    startDate: Date | null;
    endDate: Date | null;
}

export const usePeriodFilter = () => {
    const [period, setPeriod] = useState<PeriodType>('all');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    const dateRange = useMemo<DateRange>(() => {
        const now = new Date();
        let startDate: Date | null = null;
        let endDate: Date | null = null;

        switch (period) {
            case '7days':
                startDate = new Date(now);
                startDate.setDate(startDate.getDate() - 7);
                break;
            case '30days':
                startDate = new Date(now);
                startDate.setDate(startDate.getDate() - 30);
                break;
            case '90days':
                startDate = new Date(now);
                startDate.setDate(startDate.getDate() - 90);
                break;
            case 'custom':
                if (customStartDate) {
                    startDate = new Date(customStartDate);
                    startDate.setHours(0, 0, 0, 0);
                }
                if (customEndDate) {
                    endDate = new Date(customEndDate);
                    endDate.setHours(23, 59, 59, 999);
                }
                break;
            case 'all':
            default:
                startDate = null;
                endDate = null;
                break;
        }

        return { startDate, endDate };
    }, [period, customStartDate, customEndDate]);

    const daysInRange = useMemo(() => {
        if (!customStartDate || !customEndDate) return null;
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }, [customStartDate, customEndDate]);

    return {
        period,
        setPeriod,
        customStartDate,
        setCustomStartDate,
        customEndDate,
        setCustomEndDate,
        dateRange,
        daysInRange,
    };
};
