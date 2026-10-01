# Shifty — instruções para sessões de desenvolvimento

App mobile de apoio à Terapia Cognitivo-Comportamental (TCC de Ciência da Computação). Requisitos, diagramas e mockups estão em `docs/relatorio-tcc1.pdf` (capítulo 3). O app **complementa** a terapia: nada de diagnóstico, recomendação clínica automática ou perfil de psicólogo.

## Monorepo

- `backend/` — Node.js + Express 5 + Knex/PostgreSQL, TypeScript strict, ESM (`"type": "module"`, imports relativos com extensão `.js`).
- `mobile/` — Expo SDK 57 (Expo Go), expo-router em `src/app`, TypeScript strict.
- `docs/` — relatório do TCC, `glossario.md` (termos do TCC ↔ código) e `decisoes-de-arquitetura.md`.
- Pacotes independentes, cada um com seu `package.json` e lockfile. **Sem workspaces** e sem pacote de tipos compartilhado (evita configurar Metro para monorepo).

## Comandos

Backend (`cd backend`):

| Comando | O que faz |
|---|---|
| `npm run dev` | API com `tsx watch` em `HOST:PORT` (padrão `0.0.0.0:3333`) |
| `npm run build` / `npm start` | compila com `tsc` para `dist/` e roda o build |
| `npm run typecheck` / `npm run lint` | `tsc --noEmit` / ESLint type-checked |
| `npm test` | unitários + integração (`test:unit`, `test:integration` isolados) |
| `npm run migrate` / `migrate:test` / `migrate:rollback` | migrations no banco de dev / de teste / desfaz o último lote |
| `npm run seed` | dados de desenvolvimento (recusa rodar com `NODE_ENV=production`) |

Mobile (`cd mobile`): `npm run dev` (Expo), `npm run typecheck`, `npm run lint`, `npm test` (Vitest, só lógica pura), `npm run build` (`expo export` Android, teste de fumaça do bundle). Instale dependências com `npx expo install <pacote>` para obter versões compatíveis com o SDK; só use bibliotecas incluídas no Expo Go.

Ao fim de cada etapa: typecheck, lint e testes dos dois pacotes passando, depois commit.

## Arquitetura do backend (hexagonal)

```
src/domain/        entidades, value objects, erros de domínio — sem nenhuma biblioteca
src/application/   ports/ (interfaces) e use-cases/<feature>/<verbo-substantivo>.ts
src/adapters/      inbound/http (rotas, controllers, middlewares, schemas zod)
                   outbound (postgres, security, email, clock)
src/main/          config (env validado com zod), container (DI manual), server, scripts de banco
```

- Dependências só apontam para dentro: adapters → application → domain. O ESLint (`no-restricted-imports`) impede `domain/` e `application/` de importar pacotes npm, `node:*`, `adapters/` ou `main/`; precisou de infraestrutura, declare uma porta em `application/ports/` e implemente em `adapters/outbound/` com `implements`.
- Um caso de uso por arquivo: classe com `execute(input)` e tipos `XxxInput`/`XxxOutput` próprios, independentes do zod.
- zod só no adaptador HTTP (requisições, com `z.infer`) e em `main/config`.
- Repositórios tipam as linhas do banco (`XxxRow`) e devolvem entidades; linhas nunca saem do adaptador.
- Controllers finos: validam, chamam um caso de uso, mapeiam para HTTP. Erros de domínio tipados viram status HTTP em um único middleware de erro.
- Toda consulta de dados do usuário filtra por `user_id` do token. Recurso de outro usuário responde 404.
- Datas de calendário trafegam como `'YYYY-MM-DD'` (o parser do pg para `DATE` está desligado em `connection.ts`).
- Migrations são autocontidas: não importam código do projeto (o Knex as carrega com `import()` nativo nos testes, e uma migration deve ser um retrato congelado do esquema).
- Toda tabela tem `created_at`/`updated_at` e o trigger `<tabela>_set_updated_at` (função `set_updated_at()` da primeira migration).
- Usuário de desenvolvimento do seed: `teste@shifty.dev` / `Shifty123`.

## Mobile

- `src/app/` só tem rotas finas que reexportam telas de `src/features/<feature>/screens`.
- `src/features/<feature>/` contém `screens/`, `hooks/` e `api.ts`. O `api.ts` define schemas zod das respostas e os tipos com `z.infer`, sempre com o `httpClient` de `src/shared/api`.
- Tema (cores, espaçamento, fontes) só em `src/shared/theme`. Nada de cor literal nas telas.
- Estado de servidor com TanStack Query; formulários com react-hook-form + zod (mensagens em pt-BR).
- Alias `@/` → `src/`.
- Rotas tipadas (`typedRoutes`): o `.expo/types` é gerado pelo `npm run dev`; rode-o uma vez após criar rotas para o typecheck validar os caminhos.
- Sessão: o token fica no `expo-secure-store` e em memória (`shared/api/auth-session`); qualquer 401 com token encerra a sessão.

## Convenções

- Código, tabelas e colunas em inglês (snake_case no banco); textos de interface em pt-BR. Atualize `docs/glossario.md` ao criar um termo de domínio.
- Sem `any`: use `unknown` e faça narrowing. Sem código morto nem comentários óbvios.
- Testes: casos de uso com repositórios em memória (`backend/test/support/in-memory/`), rotas com supertest no banco `shifty_test`.
- Commits pequenos em Conventional Commits. **Nunca faça push nem crie branch remota sem perguntar.**

## Segurança e privacidade (LGPD: dados de saúde são sensíveis)

- Senhas e códigos de verificação com bcrypt; JWT com expiração; token no app só em `expo-secure-store`.
- Nunca registrar em log conteúdo de registros, senhas, tokens ou códigos. Única exceção: o `EmailSender` de console, que existe para mostrar o código em desenvolvimento.
- Segredos só em `.env` (ignorado). Versionar apenas `.env.example`.
