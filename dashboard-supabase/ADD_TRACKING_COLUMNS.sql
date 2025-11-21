-- SQL para adicionar colunas de rastreamento de fechamento
-- Execute este código no Supabase SQL Editor

-- 1. Adicionar coluna 'usuario_fechou' (quem marcou como fechado)
ALTER TABLE "Cadastro_Clientes" 
ADD COLUMN IF NOT EXISTS usuario_fechou TEXT;

-- 2. Adicionar coluna 'dataFechamento' (quando foi fechado pelo corretor)
ALTER TABLE "Cadastro_Clientes" 
ADD COLUMN IF NOT EXISTS "dataFechamento" TIMESTAMP;

-- 3. Adicionar coluna 'DataAtualizacao' (última alteração no status)
ALTER TABLE "Cadastro_Clientes" 
ADD COLUMN IF NOT EXISTS "DataAtualizacao" TIMESTAMP;

-- 4. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_usuario_fechou ON "Cadastro_Clientes"(usuario_fechou);
CREATE INDEX IF NOT EXISTS idx_data_fechamento ON "Cadastro_Clientes"("dataFechamento");

-- 5. Criar índice composto para consultas complexas
CREATE INDEX IF NOT EXISTS idx_fechado_usuario ON "Cadastro_Clientes"(fechado, usuario_fechou);

-- 6. Verificar se as colunas foram criadas
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'Cadastro_Clientes' 
  AND column_name IN ('usuario_fechou', 'dataFechamento', 'DataAtualizacao')
ORDER BY column_name;
