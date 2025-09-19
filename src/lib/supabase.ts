import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Funções para operações com tarefas
export const tarefasService = {
  async criar(tarefa: any) {
    const { data, error } = await supabase
      .from('tarefas')
      .insert([{
        ...tarefa,
        data_criacao: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async listar() {
    const { data, error } = await supabase
      .from('tarefas')
      .select('*')
      .order('data_criacao', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async atualizar(id: string, updates: any) {
    const { data, error } = await supabase
      .from('tarefas')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Funções para operações com processos
export const processosService = {
  async criar(processo: any) {
    const { data, error } = await supabase
      .from('processos')
      .insert([processo])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async listar() {
    const { data, error } = await supabase
      .from('processos')
      .select('*')
      .order('data_abertura', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async atualizar(id: string, updates: any) {
    const { data, error } = await supabase
      .from('processos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};