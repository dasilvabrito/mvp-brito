import { createClient } from '@supabase/supabase-js';
import type { Tarefa, Processo } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Verificar se as variáveis de ambiente estão configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Variáveis de ambiente do Supabase não configuradas. Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Criar cliente Supabase com configurações otimizadas
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web',
      'Prefer': 'return=representation'
    }
  }
});

// Função para tratar erros específicos do Supabase
const tratarErroSupabase = (error: any, operacao: string) => {
  console.error(`❌ Erro na operação ${operacao}:`, error);
  console.error('Código do erro:', error.code);
  console.error('Mensagem:', error.message);
  console.error('Detalhes:', error.details);
  console.error('Hint:', error.hint);

  // Tratamento específico para erro PGRST205
  if (error.code === 'PGRST205') {
    console.error('🚨 ERRO PGRST205: Tabela não encontrada no schema cache');
    console.error('💡 Possíveis soluções:');
    console.error('   1. Verificar se as políticas RLS estão configuradas corretamente');
    console.error('   2. Executar o script fix-database-policies.sql no painel do Supabase');
    console.error('   3. Verificar se a tabela existe e está acessível via API');
    console.error('   4. Reiniciar a API do Supabase se necessário');
    
    throw new Error(`Tabela não encontrada. Execute o script fix-database-policies.sql no painel do Supabase para corrigir as políticas RLS.`);
  }

  throw error;
};

// Funções para operações com tarefas
export const tarefasService = {
  async criar(tarefa: Omit<Tarefa, 'id' | 'created_at' | 'updated_at'>): Promise<Tarefa> {
    try {
      console.log('🔄 Criando tarefa:', tarefa);
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase não configurado. Verifique as variáveis de ambiente.');
      }

      const { data, error } = await supabase
        .from('tarefas')
        .insert([{
          nome: tarefa.nome,
          descricao: tarefa.descricao || '',
          prazo: tarefa.prazo,
          status: tarefa.status || 'pendente',
          prioridade: tarefa.prioridade || 'media',
          categoria: tarefa.categoria || 'Outros'
        }])
        .select()
        .single();
      
      if (error) {
        tratarErroSupabase(error, 'criar tarefa');
      }
      
      console.log('✅ Tarefa criada com sucesso:', data);
      return data as Tarefa;
    } catch (error) {
      console.error('❌ Erro no tarefasService.criar:', error);
      throw error;
    }
  },

  async listar(): Promise<Tarefa[]> {
    try {
      console.log('🔄 Listando tarefas...');
      
      if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('⚠️ Supabase não configurado. Retornando array vazio.');
        return [];
      }

      const { data, error } = await supabase
        .from('tarefas')
        .select('*')
        .order('data_criacao', { ascending: false });
      
      if (error) {
        // Para listagem, vamos logar o erro mas retornar array vazio para não quebrar a UI
        console.error('❌ Erro ao listar tarefas:', error);
        console.error('Código do erro:', error.code);
        console.error('Mensagem:', error.message);
        
        if (error.code === 'PGRST205') {
          console.error('🚨 ERRO PGRST205: Execute o script fix-database-policies.sql');
        }
        
        return [];
      }
      
      console.log('✅ Tarefas listadas:', data?.length || 0, 'itens');
      return data as Tarefa[] || [];
    } catch (error) {
      console.error('❌ Erro no tarefasService.listar:', error);
      return [];
    }
  },

  async atualizar(id: string, updates: Partial<Tarefa>): Promise<Tarefa> {
    try {
      console.log('🔄 Atualizando tarefa:', id, updates);
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase não configurado. Verifique as variáveis de ambiente.');
      }

      // Se estiver marcando como concluída, adicionar data de conclusão
      if (updates.status === 'concluida' && !updates.data_conclusao) {
        updates.data_conclusao = new Date().toISOString();
      }
      
      const { data, error } = await supabase
        .from('tarefas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        tratarErroSupabase(error, 'atualizar tarefa');
      }
      
      console.log('✅ Tarefa atualizada:', data);
      return data as Tarefa;
    } catch (error) {
      console.error('❌ Erro no tarefasService.atualizar:', error);
      throw error;
    }
  },

  async excluir(id: string): Promise<void> {
    try {
      console.log('🔄 Excluindo tarefa:', id);
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase não configurado. Verifique as variáveis de ambiente.');
      }

      const { error } = await supabase
        .from('tarefas')
        .delete()
        .eq('id', id);
      
      if (error) {
        tratarErroSupabase(error, 'excluir tarefa');
      }
      
      console.log('✅ Tarefa excluída com sucesso');
    } catch (error) {
      console.error('❌ Erro no tarefasService.excluir:', error);
      throw error;
    }
  }
};

// Funções para operações com processos
export const processosService = {
  async criar(processo: Omit<Processo, 'id' | 'created_at' | 'updated_at'>): Promise<Processo> {
    try {
      console.log('🔄 Criando processo:', processo);
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase não configurado. Verifique as variáveis de ambiente.');
      }

      const { data, error } = await supabase
        .from('processos')
        .insert([{
          numero_processo: processo.numero_processo,
          cliente: processo.cliente,
          status_processo: processo.status_processo || 'ativo',
          data_abertura: processo.data_abertura,
          data_fechamento: processo.data_fechamento || null,
          advogado_responsavel: processo.advogado_responsavel
        }])
        .select()
        .single();
      
      if (error) {
        tratarErroSupabase(error, 'criar processo');
      }
      
      console.log('✅ Processo criado:', data);
      return data as Processo;
    } catch (error) {
      console.error('❌ Erro no processosService.criar:', error);
      throw error;
    }
  },

  async listar(): Promise<Processo[]> {
    try {
      console.log('🔄 Listando processos...');
      
      if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('⚠️ Supabase não configurado. Retornando array vazio.');
        return [];
      }

      const { data, error } = await supabase
        .from('processos')
        .select('*')
        .order('data_abertura', { ascending: false });
      
      if (error) {
        console.error('❌ Erro ao listar processos:', error);
        console.error('Código do erro:', error.code);
        console.error('Mensagem:', error.message);
        
        if (error.code === 'PGRST205') {
          console.error('🚨 ERRO PGRST205: Execute o script fix-database-policies.sql');
        }
        
        return [];
      }
      
      console.log('✅ Processos listados:', data?.length || 0, 'itens');
      return data as Processo[] || [];
    } catch (error) {
      console.error('❌ Erro no processosService.listar:', error);
      return [];
    }
  },

  async atualizar(id: string, updates: Partial<Processo>): Promise<Processo> {
    try {
      console.log('🔄 Atualizando processo:', id, updates);
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase não configurado. Verifique as variáveis de ambiente.');
      }

      const { data, error } = await supabase
        .from('processos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        tratarErroSupabase(error, 'atualizar processo');
      }
      
      console.log('✅ Processo atualizado:', data);
      return data as Processo;
    } catch (error) {
      console.error('❌ Erro no processosService.atualizar:', error);
      throw error;
    }
  },

  async excluir(id: string): Promise<void> {
    try {
      console.log('🔄 Excluindo processo:', id);
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase não configurado. Verifique as variáveis de ambiente.');
      }

      const { error } = await supabase
        .from('processos')
        .delete()
        .eq('id', id);
      
      if (error) {
        tratarErroSupabase(error, 'excluir processo');
      }
      
      console.log('✅ Processo excluído com sucesso');
    } catch (error) {
      console.error('❌ Erro no processosService.excluir:', error);
      throw error;
    }
  }
};

// Função para testar a conexão com o Supabase
export const testarConexao = async (): Promise<boolean> => {
  try {
    console.log('🔄 Testando conexão com Supabase...');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Variáveis de ambiente não configuradas');
      return false;
    }
    
    // Teste simples de conexão
    const { data, error } = await supabase
      .from('tarefas')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Erro na conexão:', error);
      if (error.code === 'PGRST205') {
        console.error('🚨 Execute o script fix-database-policies.sql para corrigir as políticas RLS');
      }
      return false;
    }
    
    console.log('✅ Conexão com Supabase funcionando!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao testar conexão:', error);
    return false;
  }
};