'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Scale
} from 'lucide-react';
import FormularioTarefa from '@/components/FormularioTarefa';
import FormularioProcesso from '@/components/FormularioProcesso';
import { tarefasService, processosService } from '@/lib/supabase';
import type { Tarefa, Processo } from '@/lib/types';
import { 
  formatarData, 
  formatarNumeroCNJ, 
  isDataVencida, 
  diasRestantes,
  getClassePrioridade,
  getClasseStatus 
} from '@/lib/utils';

export default function Home() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para formulários
  const [mostrarFormTarefa, setMostrarFormTarefa] = useState(false);
  const [mostrarFormProcesso, setMostrarFormProcesso] = useState(false);
  const [tarefaEditando, setTarefaEditando] = useState<Tarefa | undefined>();
  const [processoEditando, setProcessoEditando] = useState<Processo | undefined>();

  // Carregar dados iniciais
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Carregar apenas tarefas e processos - sem demandas ou prazos
      const [tarefasData, processosData] = await Promise.all([
        tarefasService.listar().catch(err => {
          console.error('Erro ao carregar tarefas:', err);
          return [];
        }),
        processosService.listar().catch(err => {
          console.error('Erro ao carregar processos:', err);
          return [];
        })
      ]);
      
      setTarefas(tarefasData);
      setProcessos(processosData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados. Verifique sua conexão com o Supabase.');
    } finally {
      setLoading(false);
    }
  };

  // Handlers para tarefas
  const handleSalvarTarefa = async (tarefa: Tarefa) => {
    try {
      setError(null); // Limpar erro anterior
      
      if (tarefaEditando) {
        const tarefaAtualizada = await tarefasService.atualizar(tarefaEditando.id!, tarefa);
        setTarefas(prev => prev.map(t => t.id === tarefaEditando.id ? tarefaAtualizada : t));
      } else {
        const novaTarefa = await tarefasService.criar(tarefa);
        setTarefas(prev => [novaTarefa, ...prev]);
      }
      
      setMostrarFormTarefa(false);
      setTarefaEditando(undefined);
    } catch (err: any) {
      console.error('Erro ao salvar tarefa:', err);
      
      // Mostrar mensagem de erro específica
      const mensagemErro = err?.message || 'Erro ao salvar tarefa, tente novamente.';
      setError(mensagemErro);
      
      // Não fechar o formulário em caso de erro para o usuário poder tentar novamente
    }
  };

  const handleEditarTarefa = (tarefa: Tarefa) => {
    setTarefaEditando(tarefa);
    setMostrarFormTarefa(true);
  };

  const handleExcluirTarefa = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;
    
    try {
      await tarefasService.excluir(id);
      setTarefas(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Erro ao excluir tarefa:', err);
      setError('Erro ao excluir tarefa. Tente novamente.');
    }
  };

  const handleMarcarConcluida = async (tarefa: Tarefa) => {
    try {
      const tarefaAtualizada = await tarefasService.atualizar(tarefa.id!, {
        status: tarefa.status === 'concluida' ? 'pendente' : 'concluida'
      });
      setTarefas(prev => prev.map(t => t.id === tarefa.id ? tarefaAtualizada : t));
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      setError('Erro ao atualizar status da tarefa.');
    }
  };

  // Handlers para processos
  const handleSalvarProcesso = async (processo: Processo) => {
    try {
      setError(null); // Limpar erro anterior
      
      if (processoEditando) {
        const processoAtualizado = await processosService.atualizar(processoEditando.id!, processo);
        setProcessos(prev => prev.map(p => p.id === processoEditando.id ? processoAtualizado : p));
      } else {
        const novoProcesso = await processosService.criar(processo);
        setProcessos(prev => [novoProcesso, ...prev]);
      }
      
      setMostrarFormProcesso(false);
      setProcessoEditando(undefined);
    } catch (err: any) {
      console.error('Erro ao salvar processo:', err);
      
      // Mostrar mensagem de erro específica
      const mensagemErro = err?.message || 'Erro ao salvar processo, tente novamente.';
      setError(mensagemErro);
      
      // Não fechar o formulário em caso de erro para o usuário poder tentar novamente
    }
  };

  const handleEditarProcesso = (processo: Processo) => {
    setProcessoEditando(processo);
    setMostrarFormProcesso(true);
  };

  const handleExcluirProcesso = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este processo?')) return;
    
    try {
      await processosService.excluir(id);
      setProcessos(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Erro ao excluir processo:', err);
      setError('Erro ao excluir processo. Tente novamente.');
    }
  };

  // Cancelar formulários
  const handleCancelarFormulario = () => {
    setMostrarFormTarefa(false);
    setMostrarFormProcesso(false);
    setTarefaEditando(undefined);
    setProcessoEditando(undefined);
  };

  // Estatísticas
  const tarefasPendentes = tarefas.filter(t => t.status === 'pendente').length;
  const tarefasVencidas = tarefas.filter(t => t.status !== 'concluida' && isDataVencida(t.prazo)).length;
  const processosAtivos = processos.filter(p => p.status_processo === 'ativo').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Scale className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Controle Jurídico</h1>
                <p className="text-sm text-gray-600">Gestão de tarefas e processos</p>
              </div>
            </div>
            
            {/* Estatísticas rápidas */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{tarefasPendentes}</div>
                <div className="text-xs text-gray-500">Pendentes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{tarefasVencidas}</div>
                <div className="text-xs text-gray-500">Vencidas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{processosAtivos}</div>
                <div className="text-xs text-gray-500">Processos</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alertas de erro */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
              <Button 
                variant="link" 
                className="p-0 h-auto ml-2 text-red-600"
                onClick={() => setError(null)}
              >
                Dispensar
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Formulários */}
        {mostrarFormTarefa && (
          <div className="mb-8">
            <FormularioTarefa
              onSalvar={handleSalvarTarefa}
              onCancelar={handleCancelarFormulario}
              tarefaInicial={tarefaEditando}
            />
          </div>
        )}

        {mostrarFormProcesso && (
          <div className="mb-8">
            <FormularioProcesso
              onSalvar={handleSalvarProcesso}
              onCancelar={handleCancelarFormulario}
              processoInicial={processoEditando}
            />
          </div>
        )}

        {/* Conteúdo principal */}
        {!mostrarFormTarefa && !mostrarFormProcesso && (
          <Tabs defaultValue="tarefas" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <TabsList className="grid w-full sm:w-auto grid-cols-2">
                <TabsTrigger value="tarefas" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Tarefas ({tarefas.length})
                </TabsTrigger>
                <TabsTrigger value="processos" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Processos ({processos.length})
                </TabsTrigger>
              </TabsList>

              <div className="flex gap-2">
                <Button 
                  onClick={() => setMostrarFormTarefa(true)}
                  className="flex-1 sm:flex-none"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Tarefa
                </Button>
                <Button 
                  onClick={() => setMostrarFormProcesso(true)}
                  variant="outline"
                  className="flex-1 sm:flex-none"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Processo
                </Button>
              </div>
            </div>

            {/* Tab de Tarefas */}
            <TabsContent value="tarefas" className="space-y-4">
              {tarefas.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Clock className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma tarefa cadastrada</h3>
                    <p className="text-gray-500 text-center mb-4">
                      Comece criando sua primeira tarefa para organizar seu trabalho jurídico.
                    </p>
                    <Button onClick={() => setMostrarFormTarefa(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar primeira tarefa
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {tarefas.map((tarefa) => (
                    <Card key={tarefa.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start gap-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarcarConcluida(tarefa)}
                                className="p-1 h-auto"
                              >
                                {tarefa.status === 'concluida' ? (
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                  <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
                                )}
                              </Button>
                              <div className="flex-1">
                                <h3 className={`font-medium ${tarefa.status === 'concluida' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                  {tarefa.nome}
                                </h3>
                                {tarefa.descricao && (
                                  <p className="text-sm text-gray-600 mt-1">{tarefa.descricao}</p>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <Badge className={getClasseStatus(tarefa.status)}>
                                {tarefa.status === 'pendente' && 'Pendente'}
                                {tarefa.status === 'em_andamento' && 'Em Andamento'}
                                {tarefa.status === 'concluida' && 'Concluída'}
                                {tarefa.status === 'cancelada' && 'Cancelada'}
                              </Badge>
                              <Badge className={getClassePrioridade(tarefa.prioridade)}>
                                {tarefa.prioridade === 'baixa' && 'Baixa'}
                                {tarefa.prioridade === 'media' && 'Média'}
                                {tarefa.prioridade === 'alta' && 'Alta'}
                                {tarefa.prioridade === 'urgente' && 'Urgente'}
                              </Badge>
                              <Badge variant="outline">
                                {tarefa.categoria}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{formatarData(tarefa.prazo)}</span>
                                {isDataVencida(tarefa.prazo) && tarefa.status !== 'concluida' && (
                                  <AlertTriangle className="h-4 w-4 text-red-500 ml-1" />
                                )}
                              </div>
                              {!isDataVencida(tarefa.prazo) && tarefa.status !== 'concluida' && (
                                <span className="text-blue-600">
                                  {diasRestantes(tarefa.prazo)} dias restantes
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditarTarefa(tarefa)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleExcluirTarefa(tarefa.id!)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Tab de Processos */}
            <TabsContent value="processos" className="space-y-4">
              {processos.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum processo cadastrado</h3>
                    <p className="text-gray-500 text-center mb-4">
                      Cadastre seus processos para manter o controle completo dos casos.
                    </p>
                    <Button onClick={() => setMostrarFormProcesso(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Cadastrar primeiro processo
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {processos.map((processo) => (
                    <Card key={processo.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <div>
                              <h3 className="font-medium text-gray-900 mb-1">
                                {formatarNumeroCNJ(processo.numero_processo)}
                              </h3>
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <User className="h-4 w-4" />
                                <span>{processo.cliente}</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <Badge className={getClasseStatus(processo.status_processo)}>
                                {processo.status_processo === 'ativo' && 'Ativo'}
                                {processo.status_processo === 'arquivado' && 'Arquivado'}
                                {processo.status_processo === 'suspenso' && 'Suspenso'}
                                {processo.status_processo === 'finalizado' && 'Finalizado'}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>Abertura: {formatarData(processo.data_abertura)}</span>
                              </div>
                              {processo.data_fechamento && (
                                <div className="flex items-center gap-1">
                                  <XCircle className="h-4 w-4" />
                                  <span>Fechamento: {formatarData(processo.data_fechamento)}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1 sm:col-span-2">
                                <User className="h-4 w-4" />
                                <span>Responsável: {processo.advogado_responsavel}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditarProcesso(processo)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleExcluirProcesso(processo.id!)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}