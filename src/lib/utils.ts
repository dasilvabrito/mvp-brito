import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Valida número de processo conforme padrão CNJ (17 dígitos)
 * Formato: NNNNNNN-DD.AAAA.J.TR.OOOO
 * Onde:
 * - NNNNNNN: número sequencial do processo
 * - DD: dígito verificador
 * - AAAA: ano do ajuizamento
 * - J: segmento do poder judiciário
 * - TR: tribunal do respectivo segmento
 * - OOOO: código da origem
 */
export function validarNumeroCNJ(numero: string): boolean {
  // Remove caracteres não numéricos
  const numeroLimpo = numero.replace(/\D/g, '');
  
  // Verifica se tem exatamente 17 dígitos
  if (numeroLimpo.length !== 17) {
    return false;
  }
  
  // Extrai as partes do número
  const sequencial = numeroLimpo.substring(0, 7);
  const digitoVerificador = numeroLimpo.substring(7, 9);
  const ano = numeroLimpo.substring(9, 13);
  const segmento = numeroLimpo.substring(13, 14);
  const tribunal = numeroLimpo.substring(14, 16);
  const origem = numeroLimpo.substring(16, 20);
  
  // Valida ano (deve ser >= 1998, ano de criação do CNJ)
  const anoNum = parseInt(ano);
  const anoAtual = new Date().getFullYear();
  if (anoNum < 1998 || anoNum > anoAtual) {
    return false;
  }
  
  // Calcula dígito verificador
  const digitoCalculado = calcularDigitoVerificadorCNJ(sequencial + ano + segmento + tribunal + origem);
  
  return digitoVerificador === digitoCalculado.toString().padStart(2, '0');
}

/**
 * Calcula o dígito verificador do número CNJ
 */
function calcularDigitoVerificadorCNJ(numero: string): number {
  const pesos = [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5, 6, 7, 8];
  let soma = 0;
  
  for (let i = 0; i < numero.length; i++) {
    soma += parseInt(numero[i]) * pesos[i];
  }
  
  const resto = soma % 97;
  return 98 - resto;
}

/**
 * Formata número CNJ para exibição
 * Transforma 12345678901234567 em 1234567-89.0123.4.56.7890
 */
export function formatarNumeroCNJ(numero: string): string {
  const numeroLimpo = numero.replace(/\D/g, '');
  
  if (numeroLimpo.length !== 17) {
    return numero;
  }
  
  return `${numeroLimpo.substring(0, 7)}-${numeroLimpo.substring(7, 9)}.${numeroLimpo.substring(9, 13)}.${numeroLimpo.substring(13, 14)}.${numeroLimpo.substring(14, 16)}.${numeroLimpo.substring(16, 20)}`;
}

/**
 * Remove formatação do número CNJ
 */
export function limparNumeroCNJ(numero: string): string {
  return numero.replace(/\D/g, '');
}

/**
 * Formata data para exibição (DD/MM/AAAA)
 */
export function formatarData(data: string): string {
  if (!data) return '';
  
  const dataObj = new Date(data + 'T00:00:00');
  return dataObj.toLocaleDateString('pt-BR');
}

/**
 * Formata data para input (AAAA-MM-DD)
 */
export function formatarDataInput(data: string): string {
  if (!data) return '';
  
  const dataObj = new Date(data);
  return dataObj.toISOString().split('T')[0];
}

/**
 * Verifica se uma data está vencida
 */
export function isDataVencida(data: string): boolean {
  if (!data) return false;
  
  const hoje = new Date();
  const dataVencimento = new Date(data + 'T23:59:59');
  
  return dataVencimento < hoje;
}

/**
 * Calcula dias restantes até uma data
 */
export function diasRestantes(data: string): number {
  if (!data) return 0;
  
  const hoje = new Date();
  const dataVencimento = new Date(data + 'T23:59:59');
  
  const diffTime = dataVencimento.getTime() - hoje.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Retorna classe CSS baseada na prioridade
 */
export function getClassePrioridade(prioridade: string): string {
  switch (prioridade) {
    case 'urgente':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'alta':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'media':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'baixa':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

/**
 * Retorna classe CSS baseada no status
 */
export function getClasseStatus(status: string): string {
  switch (status) {
    case 'concluida':
    case 'finalizado':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'em_andamento':
    case 'ativo':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'pendente':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'cancelada':
    case 'arquivado':
    case 'suspenso':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}