// Tipos para o sistema de controle de tarefas jurídicas

export interface Tarefa {
  id?: string;
  nome: string;
  descricao?: string;
  prazo: string; // formato YYYY-MM-DD
  status: 'pendente' | 'em_andamento' | 'concluida' | 'cancelada';
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  categoria: string;
  data_criacao?: string;
  data_conclusao?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Processo {
  id?: string;
  numero_processo: string;
  cliente: string;
  status_processo: 'ativo' | 'arquivado' | 'suspenso' | 'finalizado';
  data_abertura: string; // formato YYYY-MM-DD
  data_fechamento?: string;
  advogado_responsavel: string;
  created_at?: string;
  updated_at?: string;
}

export interface FormularioTarefaProps {
  onSalvar: (tarefa: Tarefa) => void;
  onCancelar: () => void;
  tarefaInicial?: Tarefa;
}

export interface FormularioProcessoProps {
  onSalvar: (processo: Processo) => void;
  onCancelar: () => void;
  processoInicial?: Processo;
}

// Opções para selects
export const STATUS_TAREFA = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'em_andamento', label: 'Em Andamento' },
  { value: 'concluida', label: 'Concluída' },
  { value: 'cancelada', label: 'Cancelada' }
] as const;

export const PRIORIDADE_TAREFA = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' }
] as const;

export const STATUS_PROCESSO = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'arquivado', label: 'Arquivado' },
  { value: 'suspenso', label: 'Suspenso' },
  { value: 'finalizado', label: 'Finalizado' }
] as const;

export const CATEGORIAS_TAREFA = [
  'Audiência',
  'Petição',
  'Recurso',
  'Prazo processual',
  'Reunião cliente',
  'Pesquisa jurídica',
  'Documentação',
  'Administrativo',
  'Outros'
] as const;