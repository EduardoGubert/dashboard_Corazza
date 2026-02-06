import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

interface EmpreendimentoRow {
    empreendimento: string | null;
}

let empreendimentosCache: string[] | null = null;
let empreendimentosRequest: Promise<string[]> | null = null;

const normalizeEmpreendimento = (value: string | null): string | null => {
    if (!value) {
        return null;
    }

    const trimmedValue = value.trim();
    return trimmedValue === '' ? null : trimmedValue;
};

const fetchEmpreendimentos = async (): Promise<string[]> => {
    const { data, error } = await supabase
        .from('Cadastro_Clientes')
        .select('empreendimento')
        .not('empreendimento', 'is', null);

    if (error) {
        throw new Error(error.message);
    }

    const rows = (data as EmpreendimentoRow[] | null) ?? [];
    const uniqueEmpreendimentos = new Set<string>();

    rows.forEach((row) => {
        const normalizedValue = normalizeEmpreendimento(row.empreendimento);
        if (normalizedValue) {
            uniqueEmpreendimentos.add(normalizedValue);
        }
    });

    return Array.from(uniqueEmpreendimentos).sort((a, b) =>
        a.localeCompare(b, 'pt-BR', { sensitivity: 'base' })
    );
};

export const useEmpreendimentoFilter = () => {
    const [selectedEmpreendimento, setSelectedEmpreendimento] = useState<string>('');
    const [empreendimentos, setEmpreendimentos] = useState<string[]>(empreendimentosCache ?? []);
    const [isLoadingEmpreendimentos, setIsLoadingEmpreendimentos] = useState<boolean>(!empreendimentosCache);
    const [empreendimentoError, setEmpreendimentoError] = useState<string | null>(null);

    const loadEmpreendimentos = useCallback(async (forceRefresh = false) => {
        if (!forceRefresh && empreendimentosCache) {
            setEmpreendimentos(empreendimentosCache);
            setIsLoadingEmpreendimentos(false);
            return;
        }

        setIsLoadingEmpreendimentos(true);
        setEmpreendimentoError(null);

        try {
            if (forceRefresh || !empreendimentosRequest) {
                empreendimentosRequest = fetchEmpreendimentos();
            }

            const fetchedEmpreendimentos = await empreendimentosRequest;
            empreendimentosCache = fetchedEmpreendimentos;
            setEmpreendimentos(fetchedEmpreendimentos);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar empreendimentos';
            setEmpreendimentoError(errorMessage);
        } finally {
            setIsLoadingEmpreendimentos(false);
            empreendimentosRequest = null;
        }
    }, []);

    useEffect(() => {
        void loadEmpreendimentos();
    }, [loadEmpreendimentos]);

    useEffect(() => {
        if (selectedEmpreendimento && !empreendimentos.includes(selectedEmpreendimento)) {
            setSelectedEmpreendimento('');
        }
    }, [selectedEmpreendimento, empreendimentos]);

    return {
        selectedEmpreendimento,
        setSelectedEmpreendimento,
        empreendimentos,
        isLoadingEmpreendimentos,
        empreendimentoError,
        refreshEmpreendimentos: () => loadEmpreendimentos(true),
    };
};
