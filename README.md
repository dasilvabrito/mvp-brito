# 📋 Controle de Tarefas Jurídicas - MVP

Um aplicativo web moderno para controle e gestão de tarefas e processos jurídicos, desenvolvido com Next.js 15, React 19, TypeScript e Supabase.

## 🚀 Funcionalidades

### ✅ Gestão de Tarefas
- **Cadastro completo**: Nome, descrição, prazo, status, prioridade e categoria
- **Validação inteligente**: Verificação de prazos e campos obrigatórios
- **Status dinâmico**: Pendente, Em Andamento, Concluída, Cancelada
- **Prioridades**: Baixa, Média, Alta, Urgente (com cores visuais)
- **Categorias jurídicas**: Audiência, Petição, Recurso, Prazo processual, etc.
- **Controle de prazos**: Alertas visuais para tarefas vencidas
- **CRUD completo**: Criar, visualizar, editar e excluir tarefas

### ⚖️ Gestão de Processos
- **Validação CNJ**: Número de processo com validação automática do padrão CNJ (17 dígitos)
- **Formatação automática**: Número formatado automaticamente (0000000-00.0000.0.00.0000)
- **Dados completos**: Cliente, advogado responsável, datas de abertura/fechamento
- **Status processual**: Ativo, Arquivado, Suspenso, Finalizado
- **CRUD completo**: Criar, visualizar, editar e excluir processos

### 🎨 Interface Moderna
- **Design responsivo**: Mobile-first, funciona perfeitamente em todos os dispositivos
- **Tailwind CSS**: Estilização moderna e consistente
- **Componentes Shadcn/ui**: Interface profissional e acessível
- **Ícones Lucide**: Iconografia consistente e moderna
- **Tema jurídico**: Cores e elementos visuais apropriados para o contexto jurídico

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 15, React 19, TypeScript
- **Estilização**: Tailwind CSS v4
- **Componentes**: Shadcn/ui
- **Banco de dados**: Supabase (PostgreSQL)
- **Ícones**: Lucide React
- **Validação**: Validação customizada para números CNJ

## 📊 Estrutura do Banco de Dados

### Tabela `tarefas`
```sql
- id (UUID, PK)
- nome (VARCHAR, NOT NULL)
- descricao (TEXT)
- prazo (DATE, NOT NULL)
- status (VARCHAR, DEFAULT 'pendente')
- prioridade (VARCHAR, DEFAULT 'media')
- categoria (VARCHAR, DEFAULT 'geral')
- data_criacao (TIMESTAMP, DEFAULT now())
- data_conclusao (TIMESTAMP)
- created_at (TIMESTAMP, DEFAULT now())
- updated_at (TIMESTAMP, DEFAULT now())
```

### Tabela `processos`
```sql
- id (UUID, PK)
- numero_processo (VARCHAR, NOT NULL, UNIQUE)
- cliente (VARCHAR, NOT NULL)
- status_processo (VARCHAR, DEFAULT 'ativo')
- data_abertura (DATE, NOT NULL)
- data_fechamento (DATE)
- advogado_responsavel (VARCHAR, NOT NULL)
- created_at (TIMESTAMP, DEFAULT now())
- updated_at (TIMESTAMP, DEFAULT now())
```

## 🎯 Características do MVP

### ✨ Funcionalidades Implementadas
- [x] Cadastro de tarefas com validação completa
- [x] Cadastro de processos com validação CNJ
- [x] Interface responsiva (mobile + desktop)
- [x] CRUD completo para tarefas e processos
- [x] Validação de prazos e datas
- [x] Sistema de prioridades visuais
- [x] Formatação automática de números CNJ
- [x] Integração completa com Supabase
- [x] Tratamento de erros robusto
- [x] Estados de loading e feedback visual

### 🔧 Validações Implementadas
- **Tarefas**: Nome obrigatório, prazo válido, validação de datas
- **Processos**: Número CNJ válido (17 dígitos), cliente obrigatório, advogado obrigatório
- **Datas**: Validação de consistência entre datas de abertura/fechamento
- **Formulários**: Feedback visual de erros em tempo real

### 📱 Responsividade
- **Mobile-first**: Design otimizado para dispositivos móveis
- **Breakpoints**: Adaptação automática para tablet e desktop
- **Navegação**: Interface intuitiva em todos os tamanhos de tela
- **Formulários**: Layouts adaptativos para melhor usabilidade

## 🚀 Como Usar

1. **Visualizar dados**: A tela principal mostra estatísticas rápidas e listas de tarefas/processos
2. **Criar tarefa**: Clique em "Nova Tarefa" e preencha o formulário
3. **Criar processo**: Clique em "Novo Processo" e insira o número CNJ (será validado automaticamente)
4. **Editar**: Clique no ícone de edição em qualquer item
5. **Marcar concluída**: Clique no círculo ao lado da tarefa para marcar como concluída
6. **Excluir**: Clique no ícone de lixeira (com confirmação)

## 🔐 Configuração do Supabase

O projeto está configurado para funcionar automaticamente com Supabase. As variáveis de ambiente são gerenciadas automaticamente pelo sistema da Lasy.

### Políticas RLS
As tabelas possuem políticas RLS (Row Level Security) configuradas para permitir operações CRUD básicas.

## 📈 Próximas Funcionalidades (Roadmap)

- [ ] Dashboard com gráficos e métricas
- [ ] Sistema de notificações para prazos
- [ ] Filtros avançados e busca
- [ ] Relatórios em PDF
- [ ] Integração com calendário
- [ ] Sistema de usuários e permissões
- [ ] Anexos de documentos
- [ ] Histórico de alterações
- [ ] API REST para integrações

## 🎨 Design System

### Cores Principais
- **Azul jurídico**: `#1e40af` (elementos principais)
- **Verde sucesso**: `#059669` (tarefas concluídas)
- **Vermelho alerta**: `#dc2626` (prazos vencidos)
- **Amarelo atenção**: `#d97706` (prioridade alta)

### Tipografia
- **Fonte principal**: Inter (legibilidade otimizada)
- **Tamanhos**: Sistema responsivo com escalas adequadas

## 🔧 Arquitetura

### Estrutura de Pastas
```
src/
├── app/                 # Páginas Next.js 15
├── components/          # Componentes React
│   ├── ui/             # Componentes Shadcn/ui
│   ├── FormularioTarefa.tsx
│   └── FormularioProcesso.tsx
├── lib/                # Utilitários e configurações
│   ├── supabase.ts     # Cliente e serviços Supabase
│   ├── types.ts        # Tipos TypeScript
│   └── utils.ts        # Funções utilitárias
```

### Padrões de Código
- **TypeScript**: Tipagem estrita em todo o projeto
- **Componentes funcionais**: Hooks modernos do React
- **Separação de responsabilidades**: Lógica de negócio separada da UI
- **Tratamento de erros**: Sistema robusto de error handling

---

**Desenvolvido com ❤️ para profissionais do direito**

*Este MVP fornece uma base sólida para um sistema completo de gestão jurídica, com foco na usabilidade e eficiência.*