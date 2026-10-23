# Shifty — instruções para sessões de desenvolvimento

App mobile de apoio à Terapia Cognitivo-Comportamental (TCC de Ciência da Computação). Requisitos, diagramas e mockups estão em `docs/relatorio-tcc1.pdf` (capítulo 3). O app **complementa** a terapia: nada de diagnóstico, recomendação clínica automática ou perfil de psicólogo.

## Repositório

- `mobile/` — Expo SDK 57 (Expo Go), expo-router em `src/app`, TypeScript strict. É o único pacote: não há servidor próprio (ADR 11).
- `docs/` — relatório do TCC, `glossario.md` (termos do TCC ↔ código), `decisoes-de-arquitetura.md` e `relatorio-de-testes.md` (registro histórico; não editar).

## Comandos (`cd mobile`)

| Comando | O que faz |
|---|---|
| `npm run dev` | Expo (no emulador: `npx expo start --android`) |
| `npm run typecheck` / `npm run lint` | `tsc --noEmit` / ESLint type-checked |
| `npm test` | Vitest: lógica pura e o esquema do banco (via `node:sqlite`) |
| `npm run build` | `expo export` Android, teste de fumaça do bundle |

Instale dependências com `npx expo install <pacote>` para obter versões compatíveis com o SDK; só use bibliotecas incluídas no Expo Go (nada de `@react-native-firebase`). O APK de teste sai do perfil `preview` do `eas.json` (veja o README).

Ao fim de cada etapa: typecheck, lint e testes passando, depois commit.

## Arquitetura

- **Login:** Firebase Authentication pelo SDK JavaScript `firebase`, com sessão persistida no AsyncStorage (`src/shared/firebase/app.ts`). E-mail confirmado é obrigatório. Erros do Firebase viram mensagens em pt-BR em `shared/firebase/auth-errors.ts`.
- **Dados:** só no aparelho, em SQLite (`expo-sqlite`), em `src/shared/db/`. Nada de Firestore nem servidor.
- **Sessão no app:** `features/auth/auth-context.tsx` deriva o status (`signedOut`, `unverified`, `needsProfile`, `signedIn`) do Firebase e do perfil local; o layout raiz mostra uma pilha protegida por status.

### Banco local

- O esquema fica em `shared/db/migrations.ts`, uma entrada por versão (`PRAGMA user_version`). Nunca altere uma versão publicada: acrescente outra, para não perder os dados de quem já usa o app.
- Toda tabela tem `created_at`/`updated_at` (texto ISO) e o trigger `<tabela>_set_updated_at`. Os dados do usuário referenciam `profiles(uid)` com `ON DELETE CASCADE`.
- `PRAGMA foreign_keys = ON` vale por conexão: toda escrita passa por `writeTransaction` (fila única na conexão principal). Não use `withExclusiveTransactionAsync`, que abre outra conexão sem as FKs.
- **Toda consulta filtra pelo uid do usuário logado** (`requireUid()`). Recurso de outro usuário responde "não encontrado". O e-mail vem sempre do Firebase; não guarde cópia local.
- Datas de calendário são texto `'YYYY-MM-DD'`; horários, `'HH:MM'`.

### Estrutura do mobile

- `src/app/` só tem rotas finas que reexportam telas de `src/features/<feature>/screens`.
- `src/features/<feature>/` contém `screens/`, `hooks/`, `api.ts` e `validation.ts`. O `api.ts` é a camada de dados: lê e grava no SQLite (e chama o Firebase, em `auth` e `account`), com tipos (`interface`) próprios e linhas do banco tipadas como `XxxRow`, que nunca saem dele.
- Regras de negócio (limites de tamanho, intensidade 0–100, grupo do mesmo usuário, nome de grupo único, período de relatório) ficam nos schemas zod de `validation.ts`, usados pelo formulário e de novo pelo `api.ts` com `parseInput`. Erros para o paciente são `AppError` (`shared/errors.ts`), com campo opcional para o formulário (`applyFormError`).
- Lógica pura (tendência de emoções, períodos, validações, PDF) fica fora do SQLite e do React Native, para ser testada no Vitest.
- Tema (cores, espaçamento, fontes) só em `src/shared/theme`. Nada de cor literal nas telas.
- Estado com TanStack Query (os hooks chamam o `api.ts`); formulários com react-hook-form + zod (mensagens em pt-BR).
- Alias `@/` → `src/`.
- Rotas tipadas (`typedRoutes`): o `.expo/types` é gerado pelo `npm run dev`; rode-o uma vez após criar rotas para o typecheck validar os caminhos.

## Convenções

- Código, tabelas e colunas em inglês (snake_case no banco); textos de interface em pt-BR. Atualize `docs/glossario.md` ao criar um termo de domínio.
- Sem `any`: use `unknown` e faça narrowing. Sem código morto nem comentários óbvios.
- Commits (ADR 7): pequenos, mensagem de uma linha com prefixo Conventional Commits (`feat(mobile): ...`), sem corpo longo e **sem `Co-Authored-By` nem menção ao Claude**. **Nunca faça push nem crie branch remota sem perguntar.**

## Segurança e privacidade (LGPD: dados de saúde são sensíveis)

- Senhas só passam pelo Firebase; o app nunca as guarda. Operações sensíveis (trocar senha ou e-mail, excluir conta) reautenticam com a senha atual.
- Nunca registrar em log conteúdo de registros, senhas ou tokens.
- Valores do Firebase só em `mobile/.env` (ignorado). Versionar apenas `.env.example`.
- Excluir a conta apaga os dados locais e a conta do Firebase na mesma transação (`deleteAccount`).
