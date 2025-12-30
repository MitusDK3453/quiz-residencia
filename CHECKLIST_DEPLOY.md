# ✅ Checklist para Deploy no GitHub Pages

## 📋 Arquivos Preparados

✅ **Arquivos essenciais mantidos:**
- `index.html` - Página principal (corrigida)
- `style.css` - Estilos
- `js/` - Todos os arquivos JavaScript necessários
- `README.md` - Documentação básica
- `.gitignore` - Arquivos ignorados pelo Git

✅ **Arquivos removidos (desnecessários):**
- Todos os arquivos `.md` de documentação
- Arquivos de exemplo (`EXEMPLO_*.js`)
- Scripts de servidor local (`servidor*.bat`)
- Pasta `backend/` (não está sendo usada)

## 🔧 Correções Feitas

1. ✅ Removida mensagem de erro de servidor local do `index.html`
2. ✅ Melhorada inicialização do Supabase para funcionar no GitHub Pages
3. ✅ Adicionado `.gitignore` para ignorar arquivos desnecessários
4. ✅ Criado `README.md` básico

## 🚀 Próximos Passos

### 1. Fazer Commit e Push

```bash
git add .
git commit -m "Preparado para deploy no GitHub Pages"
git push origin main
```

### 2. Configurar GitHub Pages

1. No repositório GitHub, vá em **Settings**
2. Clique em **Pages** no menu lateral
3. Em **Source**, selecione **"main"** branch
4. Clique em **Save**
5. Aguarde 1-2 minutos

### 3. Configurar Supabase (IMPORTANTE!)

1. Acesse: https://supabase.com/dashboard
2. Vá em **Settings** → **API**
3. Em **URL Configuration**:
   - **Site URL**: `https://SEU-USUARIO.github.io/quiz-residencia`
   - **Redirect URLs**: Adicione `https://SEU-USUARIO.github.io/quiz-residencia/**`
4. Salve

### 4. Testar

Acesse: `https://SEU-USUARIO.github.io/quiz-residencia`

---

## ⚠️ Se Ainda Houver Erro

1. Abra o console do navegador (F12)
2. Verifique os erros
3. Verifique se o Supabase está carregando
4. Verifique se as credenciais estão corretas em `js/supabase.js`

---

**Pronto para deploy! 🚀**

