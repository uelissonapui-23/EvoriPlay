# EvoriPlay

PWA offline-first de minijogos, construída com React, TypeScript, Vite, IndexedDB e service worker.

## Um comando para preparar

Abra esta pasta no VS Code e execute:

```powershell
pnpm setup
```

Esse comando instala as dependências, cria `.env.local` quando necessário, inicializa o Git, conecta o repositório oficial, executa os testes e gera o build de produção.

## Publicar

Depois de autenticar GitHub e Vercel, execute:

```powershell
pnpm release
```

O comando valida novamente o projeto, envia a branch principal ao GitHub e publica a versão de produção na Vercel. A integração do Supabase é opcional para a V1 offline e será ativada quando `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` forem fornecidos no `.env.local`.

## Desenvolvimento

```powershell
pnpm dev
```

## Arquitetura

- `src/domain`: contratos estáveis do núcleo.
- `src/data`: persistência local e futuras migrações.
- `src/games`: registro modular dos jogos.
- `src/App.tsx`: shell, navegação e estados globais.
- `scripts`: configuração e publicação automatizadas.
