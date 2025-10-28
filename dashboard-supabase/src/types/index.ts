export interface Lead {
  id: number;
  name: string;
  empreendimento: string;
  created_at: string;
}

export interface Schedule {
  id: number;
  lead_id: number;
  date: string;
  broker_id: number;
}

export interface Broker {
  id: number;
  name: string;
  leads_count: number;
}

export interface SupabaseResponse<T> {
  data: T | null;
  error: string | null;
}