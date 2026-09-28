# Ver a app só pelo GitHub (sem Lovable)

## URL da app no GitHub Pages

**https://zacariasguilhermejoao-ui.github.io/chronos-social/**

## Ativar Pages (uma vez, no telemóvel ou PC)

1. Abre: https://github.com/zacariasguilhermejoao-ui/chronos-social/settings/pages  
2. Em **Source** / **Build and deployment** escolhe **GitHub Actions**  
3. Guarda

## Secrets (para login/Supabase funcionar)

1. https://github.com/zacariasguilhermejoao-ui/chronos-social/settings/secrets/actions  
2. **New repository secret**:
   - `VITE_SUPABASE_URL` = `https://tdehdxwdechsadpfencc.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = a tua anon key

## Disparar o deploy

- Qualquer push na branch `main`, ou  
- **Actions** → **Deploy GitHub Pages** → **Run workflow**

Espera 1–3 minutos e abre o link do Pages acima.

## Código (não é a app a correr)

https://github.com/zacariasguilhermejoao-ui/chronos-social  
Isto mostra ficheiros. A **app a usar** é o link `.github.io`.
