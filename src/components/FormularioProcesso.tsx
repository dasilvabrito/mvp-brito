'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Save } from 'lucide-react';
import type { Processo, FormularioProcessoProps } from '@/lib/types';
import { STATUS_PROCESSO } from '@/lib/types';
import { validarNumeroCNJ, formatarNumeroCNJ, limparNumeroCNJ } from '@/lib/utils';

export default function FormularioProcesso({ onSalvar, onCancelar, processoInicial }: FormularioProcessoProps) {
  const [processo, setProcesso] = useState<Partial<Processo>>({
    numero_processo: processoInicial?.numero_processo || '',
    cliente: processoInicial?.cliente || '',
    status_processo: processoInicial?.status_processo || 'ativo',
    data_abertura: processoInicial?.data_abertura || '',
    data_fechamento: processoInicial?.data_fechamento || '',
    advogado_responsavel: processoInicial?.advogado_responsavel || ''
  });

  const [erros, setErros] = useState<Record<string, string>>({});
  const [numeroFormatado, setNumeroFormatado] = useState(
    processoInicial?.numero_processo ? formatarNumeroCNJ(processoInicial.numero_processo) : ''
  );

  const validarFormulario = (): boolean => {
    const novosErros: Record<string, string> = {};

    // Validar número do processo
    if (!processo.numero_processo?.trim()) {
      novosErros.numero_processo = 'Número do processo é obrigatório';
    } else if (!validarNumeroCNJ(processo.numero_processo)) {
      novosErros.numero_processo = 'Número do processo inválido (deve seguir padrão CNJ com 17 dígitos)';
    }

    // Validar cliente
    if (!processo.cliente?.trim()) {
      novosErros.cliente = 'Nome do cliente é obrigatório';
    }

    // Validar data de abertura
    if (!processo.data_abertura) {
      novosErros.data_abertura = 'Data de abertura é obrigatória';
    }

    // Validar advogado responsável
    if (!processo.advogado_responsavel?.trim()) {
      novosErros.advogado_responsavel = 'Advogado responsável é obrigatório';
    }

    // Validar data de fechamento (se informada, deve ser posterior à abertura)
    if (processo.data_fechamento && processo.data_abertura) {
      const dataAbertura = new Date(processo.data_abertura);
      const dataFechamento = new Date(processo.data_fechamento);
      if (dataFechamento < dataAbertura) {
        novosErros.data_fechamento = 'Data de fechamento deve ser posterior à data de abertura';
      }
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    onSalvar(processo as Processo);
  };

  const handleChange = (campo: keyof Processo, valor: string) => {
    setProcesso(prev => ({
      ...prev,
      [campo]: valor
    }));

    // Limpar erro do campo quando usuário começar a digitar
    if (erros[campo]) {
      setErros(prev => ({
        ...prev,
        [campo]: ''
      }));
    }
  };

  const handleNumeroProcessoChange = (valor: string) => {
    // Permitir apenas números e alguns caracteres de formatação
    const valorLimpo = valor.replace(/[^\d.-]/g, '');
    
    // Limitar a 25 caracteres (formato completo)
    if (valorLimpo.length <= 25) {
      setNumeroFormatado(valorLimpo);
      
      // Salvar apenas os números no estado
      const apenasNumeros = limparNumeroCNJ(valorLimpo);
      handleChange('numero_processo', apenasNumeros);
      
      // Formatar automaticamente quando tiver 17 dígitos
      if (apenasNumeros.length === 17) {
        setNumeroFormatado(formatarNumeroCNJ(apenasNumeros));
      }
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold">
          {processoInicial ? 'Editar Processo' : 'Novo Processo'}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancelar}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Número do Processo */}
          <div className="space-y-2">
            <Label htmlFor="numero_processo">Número do Processo (CNJ) *</Label>
            <Input
              id="numero_processo"
              type="text"
              value={numeroFormatado}
              onChange={(e) => handleNumeroProcessoChange(e.target.value)}
              placeholder="0000000-00.0000.0.00.0000"
              className={erros.numero_processo ? 'border-red-500' : ''}
              maxLength={25}
            />
            {erros.numero_processo && (
              <p className="text-sm text-red-600">{erros.numero_processo}</p>
            )}
            <p className="text-xs text-gray-500">
              Formato CNJ: 17 dígitos (será formatado automaticamente)
            </p>
          </div>

          {/* Cliente */}
          <div className="space-y-2">
            <Label htmlFor="cliente">Cliente *</Label>
            <Input
              id="cliente"
              type="text"
              value={processo.cliente || ''}
              onChange={(e) => handleChange('cliente', e.target.value)}
              placeholder="Nome do cliente"
              className={erros.cliente ? 'border-red-500' : ''}
            />
            {erros.cliente && (
              <p className="text-sm text-red-600">{erros.cliente}</p>
            )}
          </div>

          {/* Advogado Responsável */}
          <div className="space-y-2">
            <Label htmlFor="advogado_responsavel">Advogado Responsável *</Label>
            <Input
              id="advogado_responsavel"
              type="text"
              value={processo.advogado_responsavel || ''}
              onChange={(e) => handleChange('advogado_responsavel', e.target.value)}
              placeholder="Nome do advogado responsável"
              className={erros.advogado_responsavel ? 'border-red-500' : ''}
            />
            {erros.advogado_responsavel && (
              <p className="text-sm text-red-600">{erros.advogado_responsavel}</p>
            )}
          </div>

          {/* Status e Data de Abertura */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status_processo">Status</Label>
              <Select
                value={processo.status_processo || 'ativo'}
                onValueChange={(value) => handleChange('status_processo', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_PROCESSO.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_abertura">Data de Abertura *</Label>
              <Input
                id="data_abertura"
                type="date"
                value={processo.data_abertura || ''}
                onChange={(e) => handleChange('data_abertura', e.target.value)}
                className={erros.data_abertura ? 'border-red-500' : ''}
              />
              {erros.data_abertura && (
                <p className="text-sm text-red-600">{erros.data_abertura}</p>
              )}
            </div>
          </div>

          {/* Data de Fechamento */}
          <div className="space-y-2">
            <Label htmlFor="data_fechamento">Data de Fechamento</Label>
            <Input
              id="data_fechamento"
              type="date"
              value={processo.data_fechamento || ''}
              onChange={(e) => handleChange('data_fechamento', e.target.value)}
              className={erros.data_fechamento ? 'border-red-500' : ''}
            />
            {erros.data_fechamento && (
              <p className="text-sm text-red-600">{erros.data_fechamento}</p>
            )}
            <p className="text-xs text-gray-500">
              Deixe em branco se o processo ainda estiver ativo
            </p>
          </div>

          {/* Botões */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button type="submit" className="flex-1 sm:flex-none">
              <Save className="w-4 h-4 mr-2" />
              {processoInicial ? 'Atualizar' : 'Salvar'} Processo
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancelar}
              className="flex-1 sm:flex-none"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}