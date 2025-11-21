-- Criar tabela de usuários no Supabase
-- Execute este SQL no SQL Editor do Supabase

-- Deletar tabela se já existir (cuidado em produção!)
DROP TABLE IF EXISTS users;

-- Criar tabela de usuários
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Admin', 'Corretor')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para busca rápida por username
CREATE INDEX idx_users_username ON users(username);

-- Inserir usuário admin padrão
-- Senha: admin123 (hash gerado com bcrypt rounds=10)
INSERT INTO users (username, password_hash, role) 
VALUES (
    'admin', 
    '$2b$10$7h91PmgC.l260WjoWBdkr.oync28nzRyvfxmFsMc7nWYRGUAFllqe', 
    'Admin'
);

-- Verificar criação
SELECT * FROM users;
