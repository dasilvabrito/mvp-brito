// Utilitários para validação e formatação

export function validarNumeroCNJ(numero: string): boolean {
  // Remove espaços, pontos e hífens
  const numeroLimpo = numero.replace(/[\s.-]/g, '');
  
  // Verifica se tem exatamente 17 dígitos
  if (numeroLimpo.length !== 17 || !/^\d{17}$/.test(numeroLimpo)) {
    return false;
  }
  
  // Validação do dígito verificador (algoritmo CNJ)
  const sequencial = numeroLimpo.substring(0, 6);
  const digitoVerificador = numeroLimpo.substring(6, 8);
  const anoAjuizamento = numeroLimpo.substring(8, 12);
  const segmentoJudiciario = numeroLimpo.substring(12, 13);
  const tribunal = numeroLimpo.substring(13, 15);
  const origem = numeroLimpo.substring(15, 17);
  
  // Calcula o dígito verificador
  const numeroParaCalculo = sequencial + anoAjuizamento + segmentoJudiciario + tribunal + origem;
  let soma = 0;
  
  for (let i = 0; i < numeroParaCalculo.length; i++) {
    soma += parseInt(numeroParaCalculo[i]) * (numeroParaCalculo.length - i + 1);
  }
  
  const resto1 = soma % 97;
  const digito1 = 98 - resto1;
  const digitoCalculado = digito1.toString().padStart(2, '0');
  
  return digitoVerificador === digitoCalculado;
}

export function formatarNumeroCNJ(numero: string): string {
  const numeroLimpo = numero.replace(/[\s.-]/g, '');
  if (numeroLimpo.length !== 17) return numero;
  
  return `${numeroLimpo.substring(0, 7)}-${numeroLimpo.substring(7, 9)}.${numeroLimpo.substring(9, 13)}.${numeroLimpo.substring(13, 14)}.${numeroLimpo.substring(14, 16)}.${numeroLimpo.substring(16, 18)}`;
}

export function formatarData(data: string): string {
  return new Date(data).toLocaleDateString('pt-BR');
}

export function formatarDataParaInput(data: string): string {
  return new Date(data).toISOString().split('T')[0];
}

export function obterCorStatus(status: string): string {
  const cores = {
    'pendente': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'em_andamento': 'bg-blue-100 text-blue-800 border-blue-200',
    'concluida': 'bg-green-100 text-green-800 border-green-200',
    'cancelada': 'bg-red-100 text-red-800 border-red-200',
    'ativo': 'bg-green-100 text-green-800 border-green-200',
    'suspenso': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'arquivado': 'bg-gray-100 text-gray-800 border-gray-200',
    'finalizado': 'bg-blue-100 text-blue-800 border-blue-200'
  };
  
  return cores[status as keyof typeof cores] || 'bg-gray-100 text-gray-800 border-gray-200';
}

export function obterCorPrioridade(prioridade: string): string {
  const cores = {
    'baixa': 'bg-green-100 text-green-800 border-green-200',
    'media': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'alta': 'bg-orange-100 text-orange-800 border-orange-200',
    'urgente': 'bg-red-100 text-red-800 border-red-200'
  };
  
  return cores[prioridade as keyof typeof cores] || 'bg-gray-100 text-gray-800 border-gray-200';
}