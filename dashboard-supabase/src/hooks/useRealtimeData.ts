import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

interface Lead {
  id: string;
  [key: string]: any;
}

const useRealtimeData = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [brokers, setBrokers] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: leadsData } = await supabase
        .from('Cadastro_Clientes')
        .select('*');
      setLeads(leadsData || []);
    };

    fetchData();

    // Realtime subscription com nova sintaxe do Supabase v2
    const channel = supabase
      .channel('realtime-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'Cadastro_Clientes' },
        (payload: any) => {
          setLeads(prev => [...prev, payload.new as Lead]);
        }
      )
      .on('postgres_changes', 
        { event: 'DELETE', schema: 'public', table: 'Cadastro_Clientes' },
        (payload: any) => {
          setLeads(prev => prev.filter((lead: Lead) => lead.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { leads, schedules, brokers };
};

export default useRealtimeData;