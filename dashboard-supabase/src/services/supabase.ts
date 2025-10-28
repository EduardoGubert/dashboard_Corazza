import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL as string;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const fetchLeads = async () => {
    const { data, error } = await supabase
        .from('Cadastro_Clientes')
        .select('empreendimento');
    if (error) {
        throw new Error(error.message);
    }
    
    // Agrupar dados manualmente no frontend
    const grouped = data?.reduce((acc: any, item: any) => {
        const empreendimento = item.empreendimento;
        if (!acc[empreendimento]) {
            acc[empreendimento] = 0;
        }
        acc[empreendimento]++;
        return acc;
    }, {});
    
    return Object.entries(grouped || {}).map(([empreendimento, count]) => ({
        empreendimento,
        count
    }));
};

export const fetchSchedules = async () => {
    const { data, error } = await supabase
        .from('Cadastro_Clientes')
        .select('created_at, agendamento')
        .order('created_at', { ascending: true });
    if (error) {
        throw new Error(error.message);
    }
    return data;
};

export const fetchLeadsByBroker = async () => {
    const { data, error } = await supabase
        .from('Cadastro_Clientes')
        .select('corretor_responsavel');
    if (error) {
        throw new Error(error.message);
    }
    
    // Agrupar dados manualmente no frontend
    const grouped = data?.reduce((acc: any, item: any) => {
        const corretor = item.corretor_responsavel;
        if (!acc[corretor]) {
            acc[corretor] = 0;
        }
        acc[corretor]++;
        return acc;
    }, {});
    
    return Object.entries(grouped || {}).map(([corretor_responsavel, count]) => ({
        corretor_responsavel,
        count
    }));
};

export default supabase;