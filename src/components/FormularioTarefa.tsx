'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Save } from 'lucide-react';
import type { Tarefa, FormularioTarefaProps } from '@/lib/types';
import { STATUS_TAREFA, PRIORIDADE_TAREFA, CATEGORIAS_TAREFA } from '@/lib/types';

export default function FormularioTarefa({ onSalvar, onCancelar, tarefaInicial }: FormularioTarefaProps) {
  const [tarefa, setTarefa] = useState<Partial<Tarefa>>({
    nome: tarefaInicial?.nome || '',
    descricao: tarefaInicial?.descricao || '',
    prazo: tarefaInicial?.prazo || '',
    status: tarefaInicial?.status || 'pendente',
    prioridade: tarefaInicial?.prioridade || 'media',
    categoria: tarefaInicial?.categoria || 'Outros'
  });

  const [erros, setErros] = useState<Record<string, string>>({});

  const validarFormulario = (): boolean => {
    const novosErros: Record<string, string> = {};

    if (!tarefa.nome?.trim()) {
      novosErros.nome = 'Nome da tarefa é obrigatório';
    }

    if (!tarefa.prazo) {
      novosErros.prazo = 'Prazo é obrigatório';
    } else {
      const hoje = new Date();
      const dataPrazo = new Date(tarefa.prazo + 'T00:00:00');
      if (dataPrazo < hoje && tarefa.status !== 'concluida') {
        novosErros.prazo = 'Prazo não pode ser anterior à data atual';
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

    onSalvar(tarefa as Tarefa);
  };

  const handleChange = (campo: keyof Tarefa, valor: string) => {
    setTarefa(prev => ({
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

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold">
          {tarefaInicial ? 'Editar Tarefa' : 'Nova Tarefa'}
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
          {/* Nome da Tarefa */}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Tarefa *</Label>
            <Input
              id="nome"
              type="text"
              value={tarefa.nome || ''}
              onChange={(e) => handleChange('nome', e.target.value)}
              placeholder="Ex: Elaborar petição inicial"
              className={erros.nome ? 'border-red-500' : ''}
            />
            {erros.nome && (
              <p className="text-sm text-red-600">{erros.nome}</p>
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={tarefa.descricao || ''}
              onChange={(e) => handleChange('descricao', e.target.value)}
              placeholder="Descreva os detalhes da tarefa..."
              rows={3}
            />
          </div>

          {/* Prazo e Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prazo">Prazo *</Label>
              <Input
                id="prazo"
                type="date"
                value={tarefa.prazo || ''}
                onChange={(e) => handleChange('prazo', e.target.value)}
                className={erros.prazo ? 'border-red-500' : ''}
              />
              {erros.prazo && (
                <p className="text-sm text-red-600">{erros.prazo}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={tarefa.status || 'pendente'}
                onValueChange={(value) => handleChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_TAREFA.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Prioridade e Categoria */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prioridade">Prioridade</Label>
              <Select
                value={tarefa.prioridade || 'media'}
                onValueChange={(value) => handleChange('prioridade', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORIDADE_TAREFA.map((prioridade) => (
                    <SelectItem key={prioridade.value} value={prioridade.value}>
                      {prioridade.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Select
                value={tarefa.categoria || 'Outros'}
                onValueChange={(value) => handleChange('categoria', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS_TAREFA.map((categoria) => (
                    <SelectItem key={categoria} value={categoria}>
                      {categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Botões */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button type="submit" className="flex-1 sm:flex-none">
              <Save className="w-4 h-4 mr-2" />
              {tarefaInicial ? 'Atualizar' : 'Salvar'} Tarefa
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