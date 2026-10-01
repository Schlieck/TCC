# Decisões de arquitetura

Registro curto das decisões tomadas durante o desenvolvimento, com o motivo de cada uma.

## 1. Expo SDK 57 e requisitos mínimos (NF003)

O app roda no Expo Go, que nas lojas só abre projetos do SDK atual. O SDK 57 (React Native 0.86) exige **Android 7+ e iOS 16.4+**. O Android 9+ do NF003 continua atendido; o NF003 deve ser atualizado para **iOS 16.4+** no TCC II (o último SDK com iOS 15.1 foi o 55).

## 2. Backend em arquitetura hexagonal

Domínio e casos de uso não conhecem Express, Knex, bcrypt nem zod. A infraestrutura entra por portas (interfaces em `application/ports`) implementadas em `adapters/outbound`. Isso permite testar todos os casos de uso com repositórios em memória. A regra de dependência é verificada pelo ESLint.

## 3. Knex sem ORM

Consultas explícitas em repositórios, migrations e seeds em TypeScript executados com `tsx` pela API programática do Knex. IDs inteiros (`GENERATED ALWAYS AS IDENTITY`), como no diagrama ER.

## 4. TypeScript 6.0 fixo

O TypeScript 7 é o mais recente, mas o typescript-eslint ainda só suporta versões abaixo de 6.1.

## 5. Monorepo sem workspaces

`backend/` e `mobile/` são pacotes independentes. Um pacote de tipos compartilhado exigiria configurar o Metro para monorepo; o mobile define os próprios tipos das respostas da API (validados com zod em tempo de execução).

## 6. Datas como texto `YYYY-MM-DD`

Datas de calendário (data do registro, período do relatório) não têm fuso horário. O parser do `pg` para `DATE` foi desligado para que o valor chegue como texto e nunca seja convertido para meia-noite UTC.

## 7. Commits curtos, com prefixo e sem coautoria de IA

Princípio fundamental do repositório. Cada commit é pequeno (uma mudança coesa) e tem mensagem de uma linha no formato Conventional Commits: prefixo (`feat`, `fix`, `docs`, `test`, `refactor`, `chore`), escopo opcional (`backend`, `mobile`) e descrição curta no imperativo, em inglês — por exemplo `feat(backend): add thought records`. Sem corpo longo e **sem trailer `Co-Authored-By` nem qualquer menção ao Claude ou a outra IA**: a autoria do TCC é do aluno.
