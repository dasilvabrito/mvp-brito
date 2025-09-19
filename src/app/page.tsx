'use client';

import { useState, useEffect } from 'react';
import { Tarefa, Processo } from '@/lib/types';
import { tarefasService, processosService } from '@/lib/supabase';
import { formatarData, obterCorStatus, obterCorPrioridade } from '@/lib/utils';
import FormularioTarefa from '@/components/FormularioTarefa';
import FormularioProcesso from '@/components/FormularioProcesso';
import { 
  Plus, 
  Calendar, 
  Clock, 
  Flag, 
  Tag, 
  FileText, 
  User, 
  UserCheck,
  Edit,
  CheckCircle,
  AlertCircle,
  Scale
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'tarefas' | 'processos'>('tarefas');
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormularioTarefa, setShowFormularioTarefa] = useState(false);
  const [showFormularioProcesso, setShowFormularioProcesso] = useState(false);
  const [tarefaParaEditar, setTarefaParaEditar] = useState<Tarefa | undefined>();
  const [processoParaEditar, setProcessoParaEditar] = useState<Processo | undefined>();

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [tarefasData, processosData] = await Promise.all([
        tarefasService.listar(),
        processosService.listar()
      ]);
      setTarefas(tarefasData || []);
      setProcessos(processosData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditarTarefa = (tarefa: Tarefa) => {
    setTarefaParaEditar(tarefa);
    setShowFormularioTarefa(true);
  };

  const handleEditarProcesso = (processo: Processo) => {
    setProcessoParaEditar(processo);
    setShowFormularioProcesso(true);
  };

  const handleConcluirTarefa = async (tarefa: Tarefa) => {
    try {
      await tarefasService.atualizar(tarefa.id!, {
        status: 'concluida',
        data_conclusao: new Date().toISOString()
      });
      carregarDados();
    } catch (error) {
      console.error('Erro ao concluir tarefa:', error);
    }
  };

  const handleCloseFormularios = () => {
    setShowFormularioTarefa(false);
    setShowFormularioProcesso(false);
    setTarefaParaEditar(undefined);
    setProcessoParaEditar(undefined);
  };

  const tarefasPendentes = tarefas.filter(t => t.status !== 'concluida').length;
  const processosAtivos = processos.filter(p => p.status_processo === 'ativo').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <Scale className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">LegalTask</h1>
                <p className="text-sm text-gray-600">Controle de Tarefas Jurídicas</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-gray-600">{tarefasPendentes} tarefas pendentes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-600">{processosAtivos} processos ativos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-4 sm:mb-0">
            <button
              onClick={() => setActiveTab('tarefas')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'tarefas'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              Tarefas
            </button>
            <button
              onClick={() => setActiveTab('processos')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'processos'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Processos
            </button>
          </div>

          <button
            onClick={() => {
              if (activeTab === 'tarefas') {
                setShowFormularioTarefa(true);
              } else {
                setShowFormularioProcesso(true);
              }
            }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="w-5 h-5 inline mr-2" />
            {activeTab === 'tarefas' ? 'Nova Tarefa' : 'Novo Processo'}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Carregando...</span>
          </div>
        ) : (
          <>
            {/* Conteúdo das Tarefas */}
            {activeTab === 'tarefas' && (
              <div className="space-y-4">
                {tarefas.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma tarefa cadastrada</h3>
                    <p className="text-gray-600 mb-6">Comece criando sua primeira tarefa jurídica</p>
                    <button
                      onClick={() => setShowFormularioTarefa(true)}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-medium"
                    >
                      <Plus className="w-5 h-5 inline mr-2" />
                      Criar Primeira Tarefa
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {tarefas.map((tarefa) => (
                      <div key={tarefa.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">{tarefa.nome}</h3>
                              <div className="flex items-center space-x-2 ml-4">
                                <button
                                  onClick={() => handleEditarTarefa(tarefa)}
                                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Editar tarefa"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                {tarefa.status !== 'concluida' && (
                                  <button
                                    onClick={() => handleConcluirTarefa(tarefa)}
                                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Marcar como concluída"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                            
                            <p className="text-gray-600 mb-4">{tarefa.descricao}</p>
                            
                            <div className="flex flex-wrap gap-3 text-sm">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">
                                  Prazo: {formatarData(tarefa.prazo)}
                                </span>
                              </div>
                              
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${obterCorStatus(tarefa.status)}`}>
                                {tarefa.status.replace('_', ' ').toUpperCase()}
                              </span>
                              
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${obterCorPrioridade(tarefa.prioridade)}`}>
                                <Flag className="w-3 h-3 inline mr-1" />
                                {tarefa.prioridade.toUpperCase()}
                              </span>
                              
                              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200">
                                <Tag className="w-3 h-3 inline mr-1" />
                                {tarefa.categoria.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Conteúdo dos Processos */}
            {activeTab === 'processos' && (
              <div className="space-y-4">
                {processos.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum processo cadastrado</h3>
                    <p className="text-gray-600 mb-6">Comece criando seu primeiro processo</p>
                    <button
                      onClick={() => setShowFormularioProcesso(true)}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-medium"
                    >
                      <Plus className="w-5 h-5 inline mr-2" />
                      Criar Primeiro Processo
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {processos.map((processo) => (
                      <div key={processo.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">{processo.numero_processo}</h3>
                                <p className="text-gray-600">{processo.cliente}</p>
                              </div>
                              <button
                                onClick={() => handleEditarProcesso(processo)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors ml-4"
                                title="Editar processo"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <div className="flex flex-wrap gap-3 text-sm">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">
                                  Abertura: {formatarData(processo.data_abertura)}
                                </span>
                              </div>
                              
                              {processo.data_fechamento && (
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-600">
                                    Fechamento: {formatarData(processo.data_fechamento)}
                                  </span>
                                </div>
                              )}
                              
                              <div className="flex items-center space-x-1">
                                <UserCheck className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">{processo.advogado_responsavel}</span>
                              </div>
                            </div>
                            
                            <div className="mt-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${obterCorStatus(processo.status_processo)}`}>
                                {processo.status_processo.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modais */}
      {showFormularioTarefa && (
        <FormularioTarefa
          onClose={handleCloseFormularios}
          onSuccess={carregarDados}
          tarefaParaEditar={tarefaParaEditar}
        />
      )}

      {showFormularioProcesso && (
        <FormularioProcesso
          onClose={handleCloseFormularios}
          onSuccess={carregarDados}
          processoParaEditar={processoParaEditar}
        />
      )}
    </div>
  );
}