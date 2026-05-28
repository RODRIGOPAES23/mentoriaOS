#!/bin/bash

echo "════════════════════════════════════════════════════════════════"
echo "  mentoriaOS — ATIVAÇÃO DO BANCO DE DADOS"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Carregar credenciais
source .env.local 2>/dev/null || {
    echo "❌ Erro: .env.local não encontrado"
    exit 1
}

SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL"
SERVICE_KEY="$SUPABASE_SERVICE_ROLE_KEY"
SCHEMA_FILE="schema.sql"

echo "✅ Credenciais carregadas"
echo "✅ URL: $SUPABASE_URL"
echo ""

# Passo 1: Testar conexão
echo "📋 Testando conexão com Supabase..."
curl_response=$(curl -s -X GET "$SUPABASE_URL/rest/v1/" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -w "\n%{http_code}")

http_code=$(echo "$curl_response" | tail -1)

if [ "$http_code" != "200" ]; then
    echo "❌ Conexão falhou (HTTP $http_code)"
    echo ""
    echo "⚠️  INSTRUÇÕES MANUAIS:"
    echo "────────────────────────────────────────────────────────────"
    echo "1. Abra: https://app.supabase.com/project/pywjcpsklvgpadxgotpn/sql/new"
    echo "2. Cole TODO o conteúdo de schema.sql"
    echo "3. Clique [Run]"
    echo "4. Depois execute: bash insert_mentorados.sh"
    echo "────────────────────────────────────────────────────────────"
    exit 1
fi

echo "✅ Conexão OK"
echo ""

# Passo 2: Ler schema.sql
if [ ! -f "$SCHEMA_FILE" ]; then
    echo "❌ Erro: $SCHEMA_FILE não encontrado"
    exit 1
fi

echo "📋 Lendo schema.sql..."
schema_content=$(cat "$SCHEMA_FILE")
echo "✅ Schema lido ($(wc -l < "$SCHEMA_FILE") linhas)"
echo ""

# Passo 3: Tentar executar (informativo)
echo "════════════════════════════════════════════════════════════════"
echo "📝 PRÓXIMO PASSO: Executar schema.sql no Supabase"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Como o Supabase não suporta SQL raw via REST API,"
echo "você precisa executar manualmente no SQL Editor."
echo ""
echo "🔗 LINK: https://app.supabase.com/project/pywjcpsklvgpadxgotpn/sql/new"
echo ""
echo "📋 INSTRUÇÕES:"
echo "1. Clique no link acima"
echo "2. Cole TODO o conteúdo de schema.sql"
echo "3. Clique no botão [Run] (verde)"
echo "4. Aguarde mensagem de sucesso"
echo ""
echo "Uma vez que o schema estiver criado, execute:"
echo "   bash insert_mentorados.sh"
echo ""
echo "════════════════════════════════════════════════════════════════"
