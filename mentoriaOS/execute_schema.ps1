# ============================================================================
# mentoriaOS — EXECUÇÃO AUTOMÁTICA DO SCHEMA
# ============================================================================
# Script PowerShell para criar schema e popular dados no Supabase

$ErrorActionPreference = "Stop"

Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  mentoriaOS — Setup Automatizado do Banco de Dados" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Variáveis de ambiente
$SUPABASE_URL = "https://pywjcpsklvgpadxgotpn.supabase.co"
$SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5d2pjcHNrbHZncGFkeGdvdHBuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTk4NTIyMCwiZXhwIjoyMDk1NTYxMjIwfQ.MM1UpDzbrV5Dk5R39fufRQB_pRzMGqo8o8T9vQcEddI"
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "✓ Credenciais Supabase carregadas" -ForegroundColor Green
Write-Host "✓ Diretório: $SCRIPT_DIR" -ForegroundColor Green
Write-Host ""

# Passo 1: Testar conexão
Write-Host "📋 Passo 1: Testando conexão com Supabase..." -ForegroundColor Yellow
try {
    $testResponse = Invoke-WebRequest -Uri "$SUPABASE_URL/rest/v1/" `
        -Headers @{
            "apikey" = $SERVICE_KEY
            "Authorization" = "Bearer $SERVICE_KEY"
        } -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✓ Conexão com Supabase OK (Status: $($testResponse.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "✗ Erro de conexão: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "⚠️  INSTRUÇÃO MANUAL:" -ForegroundColor Yellow
    Write-Host "1. Abra: https://app.supabase.com/project/pywjcpsklvgpadxgotpn/sql/new" -ForegroundColor Cyan
    Write-Host "2. Cole TODO o conteúdo de: schema.sql" -ForegroundColor Cyan
    Write-Host "3. Clique em [Run] ou pressione Ctrl+Enter" -ForegroundColor Cyan
    Write-Host "4. Depois, execute este script novamente para inserir dados." -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan

# Passo 2: Verificar se as tabelas já existem
Write-Host "📋 Passo 2: Verificando status das tabelas..." -ForegroundColor Yellow

$tablesCheck = Invoke-WebRequest -Uri "$SUPABASE_URL/rest/v1/mentorados" `
    -Headers @{
        "apikey" = $SERVICE_KEY
        "Authorization" = "Bearer $SERVICE_KEY"
        "Accept" = "application/json"
    } -Method GET -TimeoutSec 5 -ErrorAction SilentlyContinue

if ($tablesCheck.StatusCode -eq 200) {
    Write-Host "✓ Tabelas já existem no banco de dados" -ForegroundColor Green
} else {
    Write-Host "✗ Tabelas não encontradas" -ForegroundColor Red
    Write-Host ""
    Write-Host "⚠️  PRÓXIMO PASSO - CRIAR SCHEMA:" -ForegroundColor Yellow
    Write-Host "1. Abra: https://app.supabase.com/project/pywjcpsklvgpadxgotpn/sql/new" -ForegroundColor Cyan
    Write-Host "2. Cole o conteúdo de 'schema.sql'" -ForegroundColor Cyan
    Write-Host "3. Execute (Ctrl+Enter)" -ForegroundColor Cyan
    Write-Host "4. Depois execute este script novamente" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan

# Passo 3: Inserir mentorados
Write-Host "📋 Passo 3: Inserindo mentorados..." -ForegroundColor Yellow

$mentorados = @(
    @{ nome = "João Silva"; nicho = "SaaS B2B"; foco_macro = "Crescimento de Receita"; status = "Ativo"; link_instagram = "https://instagram.com/joaosilva" },
    @{ nome = "Maria Santos"; nicho = "Digital Marketing"; foco_macro = "Escala de Leads"; status = "Ativo"; link_instagram = "https://instagram.com/mariasantos" },
    @{ nome = "Carlos Oliveira"; nicho = "E-commerce"; foco_macro = "Otimização de Conversão"; status = "Ativo"; link_instagram = "https://instagram.com/carlosoliveira" },
    @{ nome = "Ana Costa"; nicho = "Consultoria"; foco_macro = "Posicionamento de Mercado"; status = "Ativo"; link_instagram = "https://instagram.com/anacosta" },
    @{ nome = "Bruno Ferreira"; nicho = "Agência Digital"; foco_macro = "Escalabilidade"; status = "Ativo"; link_instagram = "https://instagram.com/brunoferreira" }
)

$jsonBody = $mentorados | ConvertTo-Json -Depth 10

try {
    $insertResponse = Invoke-WebRequest -Uri "$SUPABASE_URL/rest/v1/mentorados" `
        -Headers @{
            "apikey" = $SERVICE_KEY
            "Authorization" = "Bearer $SERVICE_KEY"
            "Content-Type" = "application/json"
            "Prefer" = "return=representation"
        } -Method POST `
        -Body $jsonBody `
        -TimeoutSec 10

    $insertedData = $insertResponse.Content | ConvertFrom-Json
    Write-Host "✓ $($insertedData.Count) mentorados inseridos com sucesso!" -ForegroundColor Green
    Write-Host "  Mentorados:" -ForegroundColor Cyan
    foreach ($m in $insertedData) {
        Write-Host "    • $($m.nome) ($($m.nicho))" -ForegroundColor Cyan
    }
} catch {
    Write-Host "⚠️  Aviso ao inserir mentorados: $_" -ForegroundColor Yellow
    Write-Host "Isso pode significar que os mentorados já existem ou a tabela não foi criada." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ SETUP CONCLUÍDO!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Verifique em: https://app.supabase.com/project/pywjcpsklvgpadxgotpn/editor/mentorados" -ForegroundColor Cyan
Write-Host "2. Teste o app em: https://mentoriaos.vercel.app" -ForegroundColor Cyan
Write-Host "3. Submeta um checkin para ver a análise IA em ação!" -ForegroundColor Cyan
Write-Host ""
