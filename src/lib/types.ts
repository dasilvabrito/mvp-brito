// Tipos para o sistema de controle de tarefas jurídicas

export interface Tarefa {
  id?: string;
  nome: string;
  descricao: string;
  prazo: string;
  status: 'pendente' | 'em_andamento' | 'concluida' | 'cancelada';
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  categoria: 'audiencia' | 'peticao' | 'prazo' | 'reuniao' | 'pesquisa' | 'outros';
  data_criacao?: string;
  data_conclusao?: string;
}

export interface Processo {
  id?: string;
  numero_processo: string;
  cliente: string;
  status_processo: 'ativo' | 'suspenso' | 'arquivado' | 'finalizado';
  data_abertura: string;
  data_fechamento?: string;
  advogado_responsavel: string;
}

export interface FormErrors {
  [key: string]: string;
}