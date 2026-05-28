# 🔗 GITHUB SETUP — mentoriaOS

**Status**: ✅ Repo local criado | ⏳ Aguardando GitHub remoto

---

## 🎯 PRÓXIMOS PASSOS (5 MINUTOS)

### 1️⃣ Criar Repo Vazio no GitHub

1. Abra https://github.com/new
2. **Repository Name**: `mentoriaOS`
3. **Description**: "Sistema Operacional de Mentoria — Centralizar 12 meses de mentorados"
4. **Privado** ✅ (protege código)
5. **NÃO inicialize** com README, .gitignore, ou license (já temos localmente)
6. Clique **Create repository**

### 2️⃣ Copie a URL do Repo

Na tela seguinte, você verá:
```
https://github.com/[SEU_USER]/mentoriaOS.git
```

**Copie exatamente** (você vai usar no próximo passo)

### 3️⃣ Conectar Repo Local ao GitHub

No PowerShell:

```powershell
cd "C:\Users\rodri\Desktop\Projetos\NEXUS\mentoriaOS"

# Trocar [URL] pela URL copiada acima
git remote add origin https://github.com/[SEU_USER]/mentoriaOS.git
git branch -M main
git push -u origin main
```

**Output esperado**:
```
Enumerating objects: 21, done.
...
To https://github.com/[SEU_USER]/mentoriaOS.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

✅ **PRONTO!** Código está no GitHub (privado).

---

## ✅ VERIFICAÇÃO

```powershell
# Verificar que tudo está conectado
git remote -v

# Saída esperada:
# origin  https://github.com/[SEU_USER]/mentoriaOS.git (fetch)
# origin  https://github.com/[SEU_USER]/mentoriaOS.git (push)
```

---

## 🎉 SUCESSO!

Quando terminar:
- ✅ Repo local tem 21 arquivos
- ✅ GitHub remoto recebeu push
- ✅ Branch main está sincronizado
- ✅ Próximo: Supabase setup (SETUP.md ETAPA 4.2)

---

**Tempo**: ~5 minutos | **Dificuldade**: Fácil
