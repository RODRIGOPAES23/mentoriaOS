#!/bin/bash

SUPABASE_URL="https://pywjcpsklvgpadxgotpn.supabase.co"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5d2pjcHNrbHZncGFkeGdvdHBuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTk4NTIyMCwiZXhwIjoyMDk1NTYxMjIwfQ.MM1UpDzbrV5Dk5R39fufRQB_pRzMGqo8o8T9vQcEddI"

echo "Tentando inserir mentorados..."
curl -s -X POST "$SUPABASE_URL/rest/v1/mentorados" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '[
    {"nome":"João Silva","nicho":"SaaS B2B","foco_macro":"Crescimento de Receita","status":"Ativo","link_instagram":"https://instagram.com/joaosilva"},
    {"nome":"Maria Santos","nicho":"Digital Marketing","foco_macro":"Escala de Leads","status":"Ativo","link_instagram":"https://instagram.com/mariasantos"},
    {"nome":"Carlos Oliveira","nicho":"E-commerce","foco_macro":"Otimização de Conversão","status":"Ativo","link_instagram":"https://instagram.com/carlosoliveira"},
    {"nome":"Ana Costa","nicho":"Consultoria","foco_macro":"Posicionamento de Mercado","status":"Ativo","link_instagram":"https://instagram.com/anacosta"},
    {"nome":"Bruno Ferreira","nicho":"Agência Digital","foco_macro":"Escalabilidade","status":"Ativo","link_instagram":"https://instagram.com/brunoferreira"}
  ]' 2>&1
