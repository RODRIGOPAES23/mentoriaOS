#!/usr/bin/env python3
"""
Script para criar tabela de tarefas no Supabase
Uso: python3 setup_tarefas_db.py <project_ref> <service_role_key>
"""

import sys
import subprocess
import os

# SQL a executar
SQL = """
CREATE TABLE IF NOT EXISTS public.tarefas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentorado_id UUID NOT NULL REFERENCES mentorados(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  data_vencimento DATE,
  data_criacao TIMESTAMP DEFAULT now(),
  data_completada TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tarefas_mentorado_id ON tarefas(mentorado_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_mentor_id ON tarefas(mentor_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_status ON tarefas(status);
CREATE INDEX IF NOT EXISTS idx_tarefas_data_vencimento ON tarefas(data_vencimento);

COMMENT ON TABLE tarefas IS 'Pendências diárias do mentorado - checklist de tarefas';
"""

def main():
    print("=" * 70)
    print("  Supabase Setup: Criar tabela TAREFAS")
    print("=" * 70)
    print()

    # Verificar se psql está instalado
    try:
        result = subprocess.run(["psql", "--version"], capture_output=True, text=True)
        if result.returncode != 0:
            print("❌ psql não encontrado. Instale PostgreSQL.")
            print("   Windows: https://www.postgresql.org/download/windows/")
            return
        print(f"✅ {result.stdout.strip()}")
    except FileNotFoundError:
        print("❌ psql não está no PATH")
        print("   Adicione C:\\Program Files\\PostgreSQL\\XX\\bin ao PATH")
        return

    print()
    print("⚠️  AVISO DE SEGURANÇA:")
    print("   • Você vai conectar diretamente ao seu banco Supabase")
    print("   • Use a CONNECTION STRING do seu projeto")
    print("   • NÃO compartilhe a connection string")
    print()

    # Pedir connection string
    print("📍 Onde conseguir:")
    print("   Supabase Dashboard → Project Settings → Database → Connection String")
    print()
    conn_str = input("🔑 Cole sua connection string (ou pressione Ctrl+C para cancelar): ").strip()

    if not conn_str:
        print("❌ Operação cancelada")
        return

    print()
    print("🔄 Executando SQL...")
    print()

    # Executar SQL via psql
    try:
        result = subprocess.run(
            ["psql", conn_str, "-c", SQL],
            capture_output=True,
            text=True,
            timeout=10
        )

        if result.returncode == 0:
            print("✅ Sucesso! Tabela TAREFAS criada com índices")
            print()
            print(result.stdout)
        else:
            print("❌ Erro ao executar SQL:")
            print(result.stderr)
            return

    except subprocess.TimeoutExpired:
        print("❌ Timeout ao conectar ao banco")
        return
    except Exception as e:
        print(f"❌ Erro: {e}")
        return

    print()
    print("=" * 70)
    print("✅ TUDO PRONTO!")
    print("=" * 70)
    print()
    print("Próximos passos:")
    print("  1. npm run dev")
    print("  2. Teste a seção 'Pendências' no dashboard")
    print("  3. git push origin main")
    print()

if __name__ == "__main__":
    main()
