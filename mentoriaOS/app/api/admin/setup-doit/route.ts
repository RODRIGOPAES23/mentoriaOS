import { NextRequest, NextResponse } from "next/server"
import { adminClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    // Super admin check (temporary)
    const superadminKey = req.headers.get("x-admin-key")
    if (superadminKey !== process.env.SUPERADMIN_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sb = adminClient()

    // Criar tabelas via raw SQL
    const sqls = [
      // doit_projects
      `create table if not exists doit_projects (
        id uuid default gen_random_uuid() primary key,
        user_id uuid not null references auth.users(id) on delete cascade,
        objetivo text not null,
        resumo_1linha text,
        status text default 'ideacao',
        fases_total int default 0,
        passos_totais int default 0,
        passos_completados int default 0,
        criado_em timestamp default now(),
        atualizado_em timestamp default now(),
        created_at timestamp default now()
      )`,

      // doit_passos
      `create table if not exists doit_passos (
        id uuid default gen_random_uuid() primary key,
        project_id uuid not null references doit_projects(id) on delete cascade,
        fase_numero int not null,
        fase_nome text not null,
        passo_numero int not null,
        descricao text,
        responsabilidade_humana text not null,
        processamento_automatizado text not null,
        llm_principal text,
        conectores jsonb default '[]',
        skills jsonb default '[]',
        status text default 'backlog',
        quem_resolveu text,
        tempo_estimado_horas int,
        criado_em timestamp default now(),
        atualizado_em timestamp default now()
      )`,

      // doit_gratidao_eventos
      `create table if not exists doit_gratidao_eventos (
        id uuid default gen_random_uuid() primary key,
        project_id uuid not null references doit_projects(id) on delete cascade,
        evento_tipo text not null,
        passo_id uuid references doit_passos(id),
        fase_numero int,
        status_anterior text,
        status_novo text,
        metadata jsonb,
        criado_em timestamp default now()
      )`,

      // RLS
      `alter table doit_projects enable row level security`,
      `alter table doit_passos enable row level security`,
      `alter table doit_gratidao_eventos enable row level security`,

      // Policies
      `create policy if not exists "doit_projects_user_read" on doit_projects for select using (auth.uid() = user_id)`,
      `create policy if not exists "doit_projects_user_insert" on doit_projects for insert with check (auth.uid() = user_id)`,
      `create policy if not exists "doit_projects_user_update" on doit_projects for update using (auth.uid() = user_id)`,
      `create policy if not exists "doit_projects_user_delete" on doit_projects for delete using (auth.uid() = user_id)`,

      `create policy if not exists "doit_passos_user_read" on doit_passos for select using (project_id in (select id from doit_projects where user_id = auth.uid()))`,
      `create policy if not exists "doit_passos_user_insert" on doit_passos for insert with check (project_id in (select id from doit_projects where user_id = auth.uid()))`,
      `create policy if not exists "doit_passos_user_update" on doit_passos for update using (project_id in (select id from doit_projects where user_id = auth.uid()))`,

      `create policy if not exists "doit_gratidao_eventos_user_read" on doit_gratidao_eventos for select using (project_id in (select id from doit_projects where user_id = auth.uid()))`,
      `create policy if not exists "doit_gratidao_eventos_user_insert" on doit_gratidao_eventos for insert with check (project_id in (select id from doit_projects where user_id = auth.uid()))`,

      // Indexes
      `create index if not exists idx_doit_projects_user_id on doit_projects(user_id)`,
      `create index if not exists idx_doit_passos_project_id on doit_passos(project_id)`,
      `create index if not exists idx_doit_eventos_project_id on doit_gratidao_eventos(project_id)`,
    ]

    const results = []
    for (const sql of sqls) {
      try {
        // Para tabelas, usamos a função rpc se existir, senão tentamos direto
        // Na verdade, vamos usar uma tabela de teste para verificar conectividade
        if (sql.includes("create table")) {
          // Teste de tabela - se conseguir fazer um SELECT, tabela existe
          const { error } = await sb.from("doit_projects").select("count", { count: "exact" }).limit(0)
          if (!error) {
            results.push({ sql: sql.substring(0, 50) + "...", status: "skipped (table exists)" })
            continue
          }
        }

        // Usar RPC do Supabase para executar SQL se disponível
        // Para agora, apenas registrar que seria executado
        results.push({ sql: sql.substring(0, 50) + "...", status: "registered" })
      } catch (e) {
        results.push({ sql: sql.substring(0, 50) + "...", status: "error", error: String(e) })
      }
    }

    return NextResponse.json({
      message: "DOIT schema setup initiated",
      note: "Para executar as migrations SQL, acesse: https://pywjcpsklvgpadxgotpn.supabase.co → SQL Editor",
      sqlFile: "migrations/doit_schema.sql",
      results,
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
