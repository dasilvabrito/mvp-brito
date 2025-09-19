'use client';

import { useState } from 'react';
import { Tarefa, FormErrors } from '@/lib/types';
import { tarefasService } from '@/lib/supabase';
import { X, Calendar, Clock, Flag, Tag } from 'lucide-react';

interface FormularioTarefaProps {
  onClose: () => void;
  onSuccess: () => void;
  tarefaParaEditar?: Tarefa;
}

export default function FormularioTarefa({ onClose, onSuccess, tarefaParaEditar }: FormularioTarefaProps) {
  const [formData, setFormData] = useState<Partial<Tarefa>>({
    nome: tarefaParaEditar?.nome || '',
    descricao: tarefaParaEditar?.descricao || '',
    prazo: tarefaParaEditar?.prazo || '',
    status: tarefaParaEditar?.status || 'pendente',
    prioridade: tarefaParaEditar?.prioridade || 'media',
    categoria: tarefaParaEditar?.categoria || 'outros'
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
      
      if (!formData.nome?.trim()) {
        newErrors.nome = 'Nome é obrigatório';
      }
      
      if (!formData.descricao?.trim()) {
        newErrors.descricao = 'Descrição é obrigatória';
      }
      
      if (!formData.prazo) {
        newErrors.prazo = 'Prazo é obrigatório';
      } else {
        const prazoDate = new Date(formData.prazo);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        if (prazoDate < hoje) {
          newErrors.prazo = 'Prazo não pode ser anterior a hoje';
        }
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setLoading(false);
        return;
      }

      if (tarefaParaEditar?.id) {
        await tarefasService.atualizar(tarefaParaEditar.id, formData);
      } else {
        await tarefasService.criar(formData);
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
      setErrors({ geral: 'Erro ao salvar tarefa. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof Tarefa, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {tarefaParaEditar ? 'Editar Tarefa' : 'Nova Tarefa'}
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
              Nome da Tarefa *
            </label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.nome ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Ex: Elaborar petição inicial"
            />
            {errors.nome && <p className="text-red-600 text-sm mt-1">{errors.nome}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição *
            </label>
            <textarea
              value={formData.descricao}
              onChange={(e) => handleChange('descricao', e.target.value)}
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                errors.descricao ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Descreva os detalhes da tarefa..."
            />
            {errors.descricao && <p className="text-red-600 text-sm mt-1">{errors.descricao}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Prazo *
              </label>
              <input
                type="date"
                value={formData.prazo}
                onChange={(e) => handleChange('prazo', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.prazo ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.prazo && <p className="text-red-600 text-sm mt-1">{errors.prazo}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="pendente">Pendente</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="concluida">Concluída</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Flag className="w-4 h-4 inline mr-1" />
                Prioridade
              </label>
              <select
                value={formData.prioridade}
                onChange={(e) => handleChange('prioridade', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Categoria
              </label>
              <select
                value={formData.categoria}
                onChange={(e) => handleChange('categoria', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="audiencia">Audiência</option>
                <option value="peticao">Petição</option>
                <option value="prazo">Prazo</option>
                <option value="reuniao">Reunião</option>
                <option value="pesquisa">Pesquisa</option>
                <option value="outros">Outros</option>
              </select>
            </div>
          </div>

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
              {loading ? 'Salvando...' : (tarefaParaEditar ? 'Atualizar' : 'Criar Tarefa')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}