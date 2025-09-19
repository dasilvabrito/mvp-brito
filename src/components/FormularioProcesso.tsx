'use client';

import { useState } from 'react';
import { Processo, FormErrors } from '@/lib/types';
import { processosService } from '@/lib/supabase';
import { validarNumeroCNJ, formatarNumeroCNJ } from '@/lib/utils';
import { X, FileText, User, Calendar, UserCheck } from 'lucide-react';

interface FormularioProcessoProps {
  onClose: () => void;
  onSuccess: () => void;
  processoParaEditar?: Processo;
}

export default function FormularioProcesso({ onClose, onSuccess, processoParaEditar }: FormularioProcessoProps) {
  const [formData, setFormData] = useState<Partial<Processo>>({
    numero_processo: processoParaEditar?.numero_processo || '',
    cliente: processoParaEditar?.cliente || '',
    status_processo: processoParaEditar?.status_processo || 'ativo',
    data_abertura: processoParaEditar?.data_abertura || '',
    data_fechamento: processoParaEditar?.data_fechamento || '',
    advogado_responsavel: processoParaEditar?.advogado_responsavel || ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Validações
      const newErrors: FormErrors = {};
      
      if (!formData.numero_processo?.trim()) {
        newErrors.numero_processo = 'Número do processo é obrigatório';
      } else if (!validarNumeroCNJ(formData.numero_processo)) {
        newErrors.numero_processo = 'Número do processo inválido (deve seguir padrão CNJ)';
      }
      
      if (!formData.cliente?.trim()) {
        newErrors.cliente = 'Nome do cliente é obrigatório';
      }
      
      if (!formData.data_abertura) {
        newErrors.data_abertura = 'Data de abertura é obrigatória';
      }
      
      if (!formData.advogado_responsavel?.trim()) {
        newErrors.advogado_responsavel = 'Advogado responsável é obrigatório';
      }

      // Validar data de fechamento se status for finalizado
      if (formData.status_processo === 'finalizado' && !formData.data_fechamento) {
        newErrors.data_fechamento = 'Data de fechamento é obrigatória para processos finalizados';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setLoading(false);
        return;
      }

      // Formatar número do processo
      const dadosParaSalvar = {
        ...formData,
        numero_processo: formatarNumeroCNJ(formData.numero_processo!)
      };

      if (processoParaEditar?.id) {
        await processosService.atualizar(processoParaEditar.id, dadosParaSalvar);
      } else {
        await processosService.criar(dadosParaSalvar);
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar processo:', error);
      setErrors({ geral: 'Erro ao salvar processo. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof Processo, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleNumeroProcessoChange = (value: string) => {
    // Remove caracteres não numéricos para validação
    const numeroLimpo = value.replace(/[^\d]/g, '');
    setFormData(prev => ({ ...prev, numero_processo: numeroLimpo }));
    if (errors.numero_processo) {
      setErrors(prev => ({ ...prev, numero_processo: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {processoParaEditar ? 'Editar Processo' : 'Novo Processo'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.geral && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errors.geral}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Número do Processo (CNJ) *
            </label>
            <input
              type="text"
              value={formData.numero_processo}
              onChange={(e) => handleNumeroProcessoChange(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.numero_processo ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Ex: 1234567-89.2023.1.23.4567"
              maxLength={25}
            />
            {formData.numero_processo && formData.numero_processo.length >= 17 && (
              <p className="text-sm text-gray-600 mt-1">
                Formatado: {formatarNumeroCNJ(formData.numero_processo)}
              </p>
            )}
            {errors.numero_processo && <p className="text-red-600 text-sm mt-1">{errors.numero_processo}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Cliente *
            </label>
            <input
              type="text"
              value={formData.cliente}
              onChange={(e) => handleChange('cliente', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.cliente ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Nome do cliente"
            />
            {errors.cliente && <p className="text-red-600 text-sm mt-1">{errors.cliente}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <UserCheck className="w-4 h-4 inline mr-1" />
              Advogado Responsável *
            </label>
            <input
              type="text"
              value={formData.advogado_responsavel}
              onChange={(e) => handleChange('advogado_responsavel', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.advogado_responsavel ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Nome do advogado responsável"
            />
            {errors.advogado_responsavel && <p className="text-red-600 text-sm mt-1">{errors.advogado_responsavel}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status do Processo
              </label>
              <select
                value={formData.status_processo}
                onChange={(e) => handleChange('status_processo', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="ativo">Ativo</option>
                <option value="suspenso">Suspenso</option>
                <option value="arquivado">Arquivado</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Data de Abertura *
              </label>
              <input
                type="date"
                value={formData.data_abertura}
                onChange={(e) => handleChange('data_abertura', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.data_abertura ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.data_abertura && <p className="text-red-600 text-sm mt-1">{errors.data_abertura}</p>}
            </div>
          </div>

          {formData.status_processo === 'finalizado' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Data de Fechamento *
              </label>
              <input
                type="date"
                value={formData.data_fechamento}
                onChange={(e) => handleChange('data_fechamento', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.data_fechamento ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.data_fechamento && <p className="text-red-600 text-sm mt-1">{errors.data_fechamento}</p>}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Salvando...' : (processoParaEditar ? 'Atualizar' : 'Criar Processo')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}