-- SQL para adicionar a coluna 'fechado' na tabela Cadastro_Clientes
-- Execute este código no Supabase SQL Editor

-- 1. Adicionar coluna 'fechado' (se não existir)
ALTER TABLE "Cadastro_Clientes" 
ADD COLUMN IF NOT EXISTS fechado BOOLEAN DEFAULT FALSE;

-- 2. Criar índice para melhor performance nas consultas
CREATE INDEX IF NOT EXISTS idx_fechado ON "Cadastro_Clientes"(fechado);

-- 3. (Opcional) Atualizar registros existentes para garantir que não sejam NULL
UPDATE "Cadastro_Clientes" 
SET fechado = FALSE 
WHERE fechado IS NULL;

-- 4. Verificar se a coluna foi criada corretamente
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'Cadastro_Clientes' 
  AND column_name = 'fechado';
