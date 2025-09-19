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
      'X-Client-Info': 'supabase-js-web'
    }
  }
});

// Função para tratar erros específicos do Supabase
const tratarErroSupabase = (error: any, operacao: string) => {
  console.error(`❌ Erro na operação ${operacao}:`, error);
  
  // Log detalhado do erro
  if (error) {
    console.error('Código do erro:', error.code);
    console.error('Mensagem:', error.message);
    console.error('Detalhes:', error.details);
    console.error('Hint:', error.hint);
  }

  // Tratamento específico para diferentes tipos de erro
  if (error?.code === 'PGRST116') {
    throw new Error('Erro de conexão com o banco de dados. Verifique suas credenciais do Supabase.');
  }
  
  if (error?.code === 'PGRST205') {
    throw new Error('Tabela não encontrada. Verifique se as tabelas foram criadas corretamente.');
  }

  if (error?.code === '42501') {
    throw new Error('Permissão negada. Verifique as políticas RLS do Supabase.');
  }

  // Erro genérico
  throw new Error(error?.message || 'Erro desconhecido no banco de dados.');
};

// Funções para operações com tarefas
export const tarefasService = {
  async criar(tarefa: Omit<Tarefa, 'id' | 'created_at' | 'updated_at'>): Promise<Tarefa> {
    try {
      console.log('🔄 Criando tarefa:', tarefa);
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase não configurado. Verifique as variáveis de ambiente.');
      }

      // Preparar dados para inserção
      const dadosInsercao = {
        nome: tarefa.nome?.trim(),
        descricao: tarefa.descricao?.trim() || '',
        prazo: tarefa.prazo,
        status: tarefa.status || 'pendente',
        prioridade: tarefa.prioridade || 'media',
        categoria: tarefa.categoria || 'Outros'
      };

      // Validar dados obrigatórios
      if (!dadosInsercao.nome) {
        throw new Error('Nome da tarefa é obrigatório.');
      }
      
      if (!dadosInsercao.prazo) {
        throw new Error('Prazo da tarefa é obrigatório.');
      }

      console.log('📝 Dados para inserção:', dadosInsercao);

      const { data, error } = await supabase
        .from('tarefas')
        .insert([dadosInsercao])
        .select()
        .single();
      
      if (error) {
        console.error('❌ Erro do Supabase:', error);
        tratarErroSupabase(error, 'criar tarefa');
      }
      
      if (!data) {
        throw new Error('Nenhum dado retornado após inserção.');
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
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Erro ao listar tarefas:', error);
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

      if (!id) {
        throw new Error('ID da tarefa é obrigatório para atualização.');
      }

      // Se estiver marcando como concluída, adicionar data de conclusão
      const dadosAtualizacao = { ...updates };
      if (updates.status === 'concluida' && !updates.data_conclusao) {
        dadosAtualizacao.data_conclusao = new Date().toISOString();
      }
      
      const { data, error } = await supabase
        .from('tarefas')
        .update(dadosAtualizacao)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        tratarErroSupabase(error, 'atualizar tarefa');
      }
      
      if (!data) {
        throw new Error('Tarefa não encontrada ou não foi possível atualizar.');
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

      if (!id) {
        throw new Error('ID da tarefa é obrigatório para exclusão.');
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

      // Preparar dados para inserção
      const dadosInsercao = {
        numero_processo: processo.numero_processo?.trim(),
        cliente: processo.cliente?.trim(),
        status_processo: processo.status_processo || 'ativo',
        data_abertura: processo.data_abertura,
        data_fechamento: processo.data_fechamento || null,
        advogado_responsavel: processo.advogado_responsavel?.trim()
      };

      // Validar dados obrigatórios
      if (!dadosInsercao.numero_processo) {
        throw new Error('Número do processo é obrigatório.');
      }
      
      if (!dadosInsercao.cliente) {
        throw new Error('Nome do cliente é obrigatório.');
      }
      
      if (!dadosInsercao.data_abertura) {
        throw new Error('Data de abertura é obrigatória.');
      }
      
      if (!dadosInsercao.advogado_responsavel) {
        throw new Error('Advogado responsável é obrigatório.');
      }

      const { data, error } = await supabase
        .from('processos')
        .insert([dadosInsercao])
        .select()
        .single();
      
      if (error) {
        tratarErroSupabase(error, 'criar processo');
      }
      
      if (!data) {
        throw new Error('Nenhum dado retornado após inserção.');
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
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Erro ao listar processos:', error);
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

      if (!id) {
        throw new Error('ID do processo é obrigatório para atualização.');
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
      
      if (!data) {
        throw new Error('Processo não encontrado ou não foi possível atualizar.');
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

      if (!id) {
        throw new Error('ID do processo é obrigatório para exclusão.');
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
      return false;
    }
    
    console.log('✅ Conexão com Supabase funcionando!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao testar conexão:', error);
    return false;
  }
};