@echo off
REM Script para Windows - Build e push da imagem Docker com variáveis de ambiente

echo Construindo imagem Docker com variaveis de ambiente...
echo.

REM Lê variáveis do .env.production
for /f "tokens=1,2 delims==" %%a in (.env.production) do (
  if not "%%a"=="" (
    if not "%%a:~0,1%"=="#" (
      set "%%a=%%b"
    )
  )
)

set IMAGE_NAME=eduardogubert/dashboard-corazza
set TAG=latest

echo Imagem: %IMAGE_NAME%:%TAG%
echo.

REM Build da imagem
docker build ^
  --build-arg REACT_APP_SUPABASE_URL=%REACT_APP_SUPABASE_URL% ^
  --build-arg REACT_APP_SUPABASE_ANON_KEY=%REACT_APP_SUPABASE_ANON_KEY% ^
  --build-arg REACT_APP_SUPABASE_SERVICE_ROLE_KEY=%REACT_APP_SUPABASE_SERVICE_ROLE_KEY% ^
  -t %IMAGE_NAME%:%TAG% ^
  .

if %errorlevel% equ 0 (
  echo.
  echo Build concluido com sucesso!
  echo.
  set /p PUSH="Deseja fazer push para o Docker Hub? (s/n) "

  if /i "%PUSH%"=="s" (
    echo Fazendo push da imagem...
    docker push %IMAGE_NAME%:%TAG%

    if %errorlevel% equ 0 (
      echo.
      echo Push concluido! Agora voce pode atualizar no Portainer.
      echo.
      echo No Portainer:
      echo   1. Va em Stacks -^> Seu stack
      echo   2. Clique em 'Pull and redeploy'
      echo   3. Aguarde o deploy
    ) else (
      echo Erro ao fazer push da imagem
      exit /b 1
    )
  ) else (
    echo Push cancelado. Para fazer push manualmente:
    echo   docker push %IMAGE_NAME%:%TAG%
  )
) else (
  echo Erro no build da imagem
  exit /b 1
)

pause
