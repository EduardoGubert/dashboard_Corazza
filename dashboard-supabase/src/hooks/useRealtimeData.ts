import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

const useRealtimeData = () => {
  const [leads, setLeads] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [brokers, setBrokers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: leadsData } = await supabase
        .from('Cadastro_Clientes')
        .select('*');
      setLeads(leadsData);
    };

    fetchData();

    const subscription = supabase
      .from('Cadastro_Clientes')
      .on('INSERT', payload => {
        setLeads(prev => [...prev, payload.new]);
      })
      .on('DELETE', payload => {
        setLeads(prev => prev.filter(lead => lead.id !== payload.old.id));
      })
      .subscribe();

    return () => {
      supabase.removeSubscription(subscription);
    };
  }, []);

  return { leads, schedules, brokers };
};

export default useRealtimeData;