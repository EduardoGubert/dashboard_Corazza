import { DateRange } from '../hooks/usePeriodFilter';

/**
 * Aplica filtros de data em uma query do Supabase
 */
export function applyDateFilter<T>(
    query: any,
    dateRange: DateRange
): any {
    if (dateRange.startDate) {
        query = query.gte('created_at', dateRange.startDate.toISOString());
    }
    if (dateRange.endDate) {
        query = query.lte('created_at', dateRange.endDate.toISOString());
    }
    return query;
}

/**
 * Formata data para exibição em português
 */
export function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Agrupa dados por data
 */
export function groupByDate<T extends { created_at: string }>(
    data: T[],
    valueExtractor?: (item: T) => number
): Record<string, number> {
    const dateMap: Record<string, number> = {};

    data.forEach((item) => {
        const date = new Date(item.created_at).toLocaleDateString('pt-BR');
        const value = valueExtractor ? valueExtractor(item) : 1;
        dateMap[date] = (dateMap[date] || 0) + value;
    });

    return dateMap;
}

/**
 * Ordena datas em formato pt-BR
 */
export function sortDates(dates: string[]): string[] {
    return dates.sort((a, b) => {
        const [dayA, monthA, yearA] = a.split('/').map(Number);
        const [dayB, monthB, yearB] = b.split('/').map(Number);
        return new Date(yearA, monthA - 1, dayA).getTime() - new Date(yearB, monthB - 1, dayB).getTime();
    });
}

/**
 * Calcula valores acumulados
 */
export function calculateAccumulated(dateMap: Record<string, number>, sortedDates: string[]): number[] {
    let accumulated = 0;
    return sortedDates.map((date) => {
        accumulated += dateMap[date];
        return accumulated;
    });
}
