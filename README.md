# 🏛️ LegalTask - MVP Controle de Tarefas Jurídicas

Um aplicativo moderno e responsivo para controle de tarefas e processos jurídicos, desenvolvido com Next.js 15, React 19 e Supabase.

## ✨ Funcionalidades

### 📋 Gestão de Tarefas
- **Cadastro completo**: Nome, descrição, prazo, status, prioridade e categoria
- **Status**: Pendente, Em Andamento, Concluída, Cancelada
- **Prioridades**: Baixa, Média, Alta, Urgente
- **Categorias**: Audiência, Petição, Prazo, Reunião, Pesquisa, Outros
- **Edição e conclusão** de tarefas em tempo real

### ⚖️ Gestão de Processos
- **Validação CNJ**: Número de processo com validação automática do padrão CNJ (17 dígitos)
- **Formatação automática**: Exibição no formato padrão CNJ
- **Informações completas**: Cliente, advogado responsável, datas de abertura/fechamento
- **Status**: Ativo, Suspenso, Arquivado, Finalizado

### 🎨 Interface Moderna
- **Design responsivo**: Funciona perfeitamente em mobile e desktop
- **Gradientes modernos**: Visual profissional com cores azul/índigo
- **Animações suaves**: Transições e hover effects
- **Ícones Lucide**: Interface limpa e intuitiva
- **Tailwind CSS**: Styling moderno e consistente

## 🛠️ Tecnologias

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Banco de Dados**: Supabase (PostgreSQL)
- **Ícones**: Lucide React
- **Validação**: Validação customizada CNJ

## 🚀 Como Usar

### 1. Configurar Supabase
1. Vá em **Configurações do Projeto** → **Integrações**
2. Conecte sua conta Supabase
3. Selecione ou crie um projeto Supabase

### 2. Criar Tabelas no Banco
Execute o script SQL disponível em `database-setup.sql` no SQL Editor do Supabase:

```sql
-- Criar tabela de tarefas
CREATE TABLE IF NOT EXISTS tarefas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  prazo DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pendente', 'em_andamento', 'concluida', 'cancelada')) DEFAULT 'pendente',
  prioridade TEXT NOT NULL CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente')) DEFAULT 'media',
  categoria TEXT NOT NULL CHECK (categoria IN ('audiencia', 'peticao', 'prazo', 'reuniao', 'pesquisa', 'outros')) DEFAULT 'outros',
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_conclusao TIMESTAMP WITH TIME ZONE
);

-- Criar tabela de processos
CREATE TABLE IF NOT EXISTS processos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_processo TEXT NOT NULL UNIQUE,
  cliente TEXT NOT NULL,
  status_processo TEXT NOT NULL CHECK (status_processo IN ('ativo', 'suspenso', 'arquivado', 'finalizado')) DEFAULT 'ativo',
  data_abertura DATE NOT NULL,
  data_fechamento DATE,
  advogado_responsavel TEXT NOT NULL
);

-- Habilitar RLS e criar políticas permissivas para desenvolvimento
ALTER TABLE tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE processos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir todas as operações em tarefas" ON tarefas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todas as operações em processos" ON processos FOR ALL USING (true) WITH CHECK (true);
```

### 3. Usar o Aplicativo
- **Tarefas**: Clique em "Nova Tarefa" para cadastrar tarefas jurídicas
- **Processos**: Clique em "Novo Processo" para cadastrar processos com validação CNJ
- **Edição**: Use os ícones de edição para modificar registros existentes
- **Conclusão**: Marque tarefas como concluídas com um clique

## 📱 Interface Responsiva

### Mobile
- Menu de abas otimizado para toque
- Formulários adaptados para telas pequenas
- Cards empilhados verticalmente
- Botões com tamanho adequado para dedos

### Desktop
- Layout em grid responsivo
- Formulários em duas colunas
- Hover effects e transições suaves
- Aproveitamento total da tela

## 🔧 Estrutura do Projeto

```
src/
├── app/
│   ├── page.tsx              # Página principal com dashboard
│   └── layout.tsx            # Layout base da aplicação
├── components/
│   ├── FormularioTarefa.tsx  # Modal para cadastro/edição de tarefas
│   └── FormularioProcesso.tsx # Modal para cadastro/edição de processos
└── lib/
    ├── supabase.ts           # Cliente e serviços Supabase
    ├── types.ts              # Interfaces TypeScript
    └── utils.ts              # Utilitários e validações
```

## 🎯 Validações Implementadas

### Tarefas
- Nome e descrição obrigatórios
- Prazo não pode ser anterior à data atual
- Status e prioridade com valores pré-definidos

### Processos
- Número CNJ com validação completa do algoritmo
- Formatação automática no padrão CNJ
- Cliente e advogado responsável obrigatórios
- Data de fechamento obrigatória para processos finalizados

## 🔐 Segurança

- **Row Level Security (RLS)** habilitado no Supabase
- Políticas permissivas para desenvolvimento
- Validação tanto no frontend quanto no banco de dados
- Tipos TypeScript para segurança de dados

## 🎨 Design System

### Cores
- **Primária**: Gradiente azul/índigo (#3B82F6 → #6366F1)
- **Status**: Verde (concluído), Amarelo (pendente), Azul (em andamento), Vermelho (cancelado)
- **Prioridades**: Verde (baixa), Amarelo (média), Laranja (alta), Vermelho (urgente)

### Componentes
- Cards com sombras suaves e bordas arredondadas
- Botões com gradientes e efeitos hover
- Formulários com validação visual
- Ícones consistentes do Lucide React

## 📈 Próximos Passos

1. **Autenticação**: Implementar login/registro de usuários
2. **Filtros**: Adicionar filtros por status, prioridade, categoria
3. **Busca**: Sistema de busca por nome/descrição
4. **Relatórios**: Dashboard com métricas e gráficos
5. **Notificações**: Alertas para prazos próximos
6. **Anexos**: Upload de documentos relacionados

---

**Desenvolvido com ❤️ usando Next.js 15, React 19 e Supabase**