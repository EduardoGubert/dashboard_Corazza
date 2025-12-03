#!/bin/sh
# filepath: env.sh

# Gera o config.js com as variáveis de ambiente
cat <<EOF > /usr/share/nginx/html/config.js
window._env_ = {
  REACT_APP_SUPABASE_URL: "${REACT_APP_SUPABASE_URL}",
  REACT_APP_SUPABASE_ANON_KEY: "${REACT_APP_SUPABASE_ANON_KEY}",
  REACT_APP_SUPABASE_SERVICE_ROLE_KEY: "${REACT_APP_SUPABASE_SERVICE_ROLE_KEY}"
};
EOF

# Inicia o nginx
nginx -g 'daemon off;'