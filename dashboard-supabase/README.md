# Dashboard Supabase

Este projeto é um Dashboard que consome dados da tabela `Cadastro_Clientes` do Supabase. O Dashboard inclui gráficos em tempo real que mostram:

- A quantidade de entrada de Leads por empreendimento.
- A quantidade de agendamentos.
- A contagem de leads por corretor responsável.

## Estrutura do Projeto

A estrutura do projeto é a seguinte:

```
dashboard-supabase
├── src
│   ├── components
│   │   ├── Dashboard.tsx
│   │   ├── Charts
│   │   │   ├── LeadsChart.tsx
│   │   │   ├── SchedulesChart.tsx
│   │   │   └── BrokerChart.tsx
│   │   └── Layout
│   │       ├── Header.tsx
│   │       └── Sidebar.tsx
│   ├── services
│   │   └── supabase.ts
│   ├── hooks
│   │   └── useRealtimeData.ts
│   ├── types
│   │   └── index.ts
│   ├── utils
│   │   └── chartConfig.ts
│   ├── App.tsx
│   └── index.tsx
├── public
│   └── index.html
├── docker
│   ├── Dockerfile
│   └── docker-compose.yml
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── .env.example
└── README.md
```

## Instalação

1. Clone o repositório:
   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd dashboard-supabase
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Crie um arquivo `.env` a partir do exemplo:
   ```bash
   cp .env.example .env
   ```

4. Preencha as credenciais do Supabase no arquivo `.env`:
   ```
   SUPABASE_URL=<sua_url_do_supabase>
   SUPABASE_ANON_KEY=<sua_chave_anonima>
   SUPABASE_SERVICE_ROLE_KEY=<sua_chave_de_servico_opcional>
   ```

## Uso

Para iniciar o projeto, utilize o Docker:

```bash
docker-compose up --build
```

A aplicação estará disponível em `http://localhost:3000`.

## Credenciais do Supabase

As credenciais necessárias para este projeto incluem:

1. **URL do Supabase**: A URL do seu projeto Supabase.
2. **Anon Key**: A chave pública que permite acesso aos dados do Supabase.
3. **Service Role Key (opcional)**: Se você precisar de permissões adicionais para operações específicas.

Essas credenciais devem ser armazenadas no arquivo `.env`, que será referenciado no arquivo `src/services/supabase.ts` para configurar a conexão com o Supabase.

## Contribuição

Sinta-se à vontade para contribuir com melhorias e correções. Faça um fork do repositório e envie um pull request com suas alterações.