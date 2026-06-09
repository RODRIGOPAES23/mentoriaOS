# 🌐 Configurar doit.cklareza.com

**Objetivo**: Fazer `doit.cklareza.com` apontar para a aplicação DOIT  
**Tempo**: 5 minutos  
**Pré-requisito**: `cklareza.com` já está configurado no Vercel

---

## Passo 1: Adicionar Domínio no Vercel

1. Abra: https://vercel.com/dashboard
2. Selecione o projeto: **mentoriaos**
3. Vá para: **Settings → Domains**
4. Clique em: **Add Domain**
5. Digite: `doit.cklareza.com`
6. Clique em: **Add**

Vercel vai mostrar 2 opções:
- **Use default Vercel nameservers** (recomendado se Vercel já gerencia cklareza.com)
- **Add a CNAME record** (se seu DNS é em outro lugar)

---

## Passo 2: Configurar DNS (Se necessário)

### Opção A: DNS no Vercel (Recomendado)

Se `cklareza.com` já está no Vercel:
1. Vercel vai auto-gerar o CNAME
2. Nada a fazer — vai funcionar em 24-48h

### Opção B: DNS Customizado (ex: GoDaddy, Namecheap, etc)

Se `cklareza.com` está em outro provedor:

1. No Vercel, copie o **CNAME target** mostrado
   - Exemplo: `cname.vercel-dns.com`

2. Vá para seu provedor DNS (ex: GoDaddy, Namecheap)

3. Adicione um novo **CNAME record**:
   ```
   Nome:  doit
   Tipo:  CNAME
   Valor: cname.vercel-dns.com
   ```

4. Salve e aguarde propagação (5-30 minutos)

---

## Passo 3: Verificar

1. Volte ao Vercel
2. Veja se o status mudou para **✅ Valid Configuration**
3. Acesse: https://doit.cklareza.com
4. Pronto! 🎉

---

## Status Atual

- ✅ App deployada em Vercel
- ✅ Código em `https://mentioriaos.vercel.app/doit`
- ⏳ Domínio `doit.cklareza.com` — você configura (5 min)

---

## Troubleshooting

### "Domain is already in use by another project"
- Verificar se `doit.cklareza.com` já existe em outro projeto
- Se sim, remover de lá e adicionar em mentoriaOS

### "Invalid configuration"
- Aguardar DNS propagar (pode levar 48h)
- Ou tentar adicionar de novo

### "CNAME mismatch"
- Verificar se o CNAME no seu DNS bate com o do Vercel
- Copiar e colar exatamente igual

---

## Após Configurado

Depois que `doit.cklareza.com` estiver operacional:

1. **Ir para**: https://doit.cklareza.com
2. **Testar**: Criar projeto "Quero correr 42km"
3. **Verificar**: Checkboxes, expandable sections, 3 views funcionando
4. **Deploy em produção**! 🚀

---

**Rodrigo Rafael** | NEXUS | 2026-06-08
