# 🔐 Sistema de Autenticação - Dashboard Corazza

Sistema completo de autenticação com login, perfis de usuário (Admin/Corretor) e gerenciamento de usuários.

## 📋 Índice

- [Tecnologias](#tecnologias)
- [Estrutura](#estrutura)
- [Instalação](#instalação)
- [Uso](#uso)
- [API Endpoints](#api-endpoints)
- [Perfis de Usuário](#perfis-de-usuário)

---

## 🛠️ Tecnologias

### Backend
- **Node.js + Express** - Servidor HTTP
- **SQLite (better-sqlite3)** - Banco de dados leve
- **bcryptjs** - Hash de senhas
- **jsonwebtoken** - Autenticação JWT
- **CORS** - Compartilhamento de recursos

### Frontend
- **React + TypeScript** - Interface
- **React Router** - Navegação
- **Axios** - Requisições HTTP
- **Context API** - Gerenciamento de estado
- **Tailwind CSS** - Estilização

---

## 📁 Estrutura

```
dashboard-supabase/
├── server/                      # Backend Node.js
│   ├── database.js             # Configuração SQLite
│   ├── server.js               # Servidor Express
│   ├── seed.js                 # Criar usuário admin inicial
│   ├── package.json
│   ├── .env
│   ├── routes/
│   │   └── auth.js             # Rotas de autenticação
│   └── middleware/
│       └── auth.js             # Middlewares JWT
│
└── src/                         # Frontend React
    ├── components/
    │   ├── Auth/
    │   │   ├── LoginPage.tsx   # Tela de login
    │   │   ├── UserManagement.tsx  # Gerenciar usuários (Admin)
    │   │   └── ProtectedRoute.tsx  # Proteção de rotas
    │   └── Dashboard.tsx
    ├── contexts/
    │   └── AuthContext.tsx     # Context de autenticação
    ├── services/
    │   └── auth.ts             # Service de autenticação
    └── types/
        └── index.ts            # Tipos TypeScript
```

---

## 🚀 Instalação

### 1️⃣ Instalar dependências do Backend

```bash
cd server
npm install
```

### 2️⃣ Configurar variáveis de ambiente do Backend

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite `server/.env` e configure:

```env
PORT=5000
JWT_SECRET=seu_secret_super_secreto_aqui_mude_em_producao
NODE_ENV=development
```

**⚠️ IMPORTANTE:** Mude o `JWT_SECRET` para uma string aleatória forte em produção!

### 3️⃣ Criar usuário Admin inicial

Execute o script seed:

```bash
npm run seed
```

Isso criará o usuário:
- **Username:** `admin`
- **Password:** `admin123`
- **Role:** `Admin`

**⚠️ IMPORTANTE:** Altere a senha após o primeiro login!

### 4️⃣ Instalar dependências do Frontend

Volte para a raiz do projeto:

```bash
cd ..
npm install
```

### 5️⃣ Configurar variáveis de ambiente do Frontend

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite `.env` e configure:

```env
# Supabase (já existente)
REACT_APP_SUPABASE_URL=sua_url_do_supabase
REACT_APP_SUPABASE_ANON_KEY=sua_chave_anonima

# Auth Server (NOVO)
REACT_APP_AUTH_API_URL=http://localhost:5000/api/auth
```

---

## ▶️ Uso

### Iniciar o Backend (Terminal 1)

```bash
cd server
npm run dev
```

O servidor estará rodando em: `http://localhost:5000`

### Iniciar o Frontend (Terminal 2)

```bash
npm start
```

O app estará rodando em: `http://localhost:3000`

### Login inicial

1. Acesse `http://localhost:3000`
2. Você será redirecionado para `/login`
3. Use as credenciais:
   - **Usuário:** `admin`
   - **Senha:** `admin123`

---

## 🔐 Perfis de Usuário

### 👑 Admin
- Acesso completo ao dashboard
- Pode **criar novos usuários**
- Pode **deletar usuários**
- Acessa a página `/users`

### 👤 Corretor
- Acesso ao dashboard
- **Não pode** criar ou gerenciar usuários
- Apenas visualização

---

## 📡 API Endpoints

### `POST /api/auth/login`
Login de usuário

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "Admin"
  }
}
```

---

### `POST /api/auth/register` 🔒 Admin only
Criar novo usuário

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "username": "corretor1",
  "password": "senha123",
  "role": "Corretor"
}
```

**Response:**
```json
{
  "message": "Usuário criado com sucesso",
  "user": {
    "id": 2,
    "username": "corretor1",
    "role": "Corretor"
  }
}
```

---

### `GET /api/auth/me` 🔒 Autenticado
Obter dados do usuário logado

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "username": "admin",
  "role": "Admin",
  "created_at": "2025-11-10 10:30:00"
}
```

---

### `GET /api/auth/users` 🔒 Admin only
Listar todos os usuários

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "username": "admin",
    "role": "Admin",
    "created_at": "2025-11-10 10:30:00"
  },
  {
    "id": 2,
    "username": "corretor1",
    "role": "Corretor",
    "created_at": "2025-11-10 11:00:00"
  }
]
```

---

### `DELETE /api/auth/users/:id` 🔒 Admin only
Deletar usuário

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Usuário deletado com sucesso"
}
```

---

## 🔒 Segurança

### Senhas
- Todas as senhas são **hasheadas com bcrypt** (10 rounds)
- Nunca armazenadas em texto plano

### Tokens JWT
- Expiração: **7 dias**
- Armazenados no `localStorage`
- Enviados no header `Authorization: Bearer <token>`

### Proteção de Rotas
- **Frontend:** Componente `<ProtectedRoute>`
- **Backend:** Middlewares `isAuth` e `isAdmin`

---

## 🎯 Fluxo de Autenticação

```
1. Usuário acessa / → Redireciona para /login (se não autenticado)
2. Usuário faz login → Recebe token JWT
3. Token salvo no localStorage
4. Requisições incluem token no header
5. Backend valida token
6. Usuário acessa dashboard protegido
```

---

## 🗄️ Banco de Dados

### Tabela: `users`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INTEGER | Primary Key (autoincrement) |
| `username` | TEXT | Username único |
| `password` | TEXT | Hash bcrypt da senha |
| `role` | TEXT | 'Admin' ou 'Corretor' |
| `created_at` | DATETIME | Data de criação |

**Arquivo:** `server/auth.db` (SQLite)

---

## 📝 Notas Importantes

1. **Altere o JWT_SECRET em produção!**
2. **Mude a senha do admin após primeiro login**
3. **Use HTTPS em produção**
4. **Considere rate limiting para /login**
5. **Faça backup do auth.db**

---

## 🐛 Troubleshooting

### "Cannot find module 'axios'"
```bash
npm install axios
```

### "CORS error"
Verifique se o servidor backend está rodando na porta 5000.

### "Token inválido"
Faça logout e login novamente. O token pode ter expirado.

---

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação do projeto principal.

---

**Desenvolvido para Dashboard Corazza** 🏢
