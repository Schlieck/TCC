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

## 8. Relatórios calculados no domínio

A média de intensidade por emoção é calculada por uma função pura (`buildEmotionTrend`), testada sem banco. O agrupamento depende só do tamanho do período: até 14 dias, por dia; até 92 dias, em blocos de 7 dias a partir do início; acima disso, por mês de calendário. Assim semana → dia, mês → semana e ano → mês, e o mesmo vale para intervalos personalizados e relatórios salvos, que guardam só nome e período (o gráfico é sempre recalculado com os registros atuais).

## 9. Cores do gráfico

Cada emoção tem uma cor fixa, que acompanha a emoção e não a posição na lista. A paleta é a categórica de referência de visualização de dados (oito tons em ordem validada para daltonismo) e foi verificada com contraste mínimo de 3:1 sobre o fundo escuro do gráfico (`#262626`). Diferente da Figura 13, o gráfico usa fundo escuro para seguir o tema do app; legenda, tooltip e a tabela "Ver os números em tabela" garantem que a leitura não dependa só da cor.

## 10. Cadastro confirmado por e-mail

O cadastro não diz se um e-mail já tem conta: `POST /auth/register` sempre responde 202. Se o e-mail é novo, os dados validados (com o hash da senha) ficam em `pending_registrations` e um código é enviado; a conta só entra em `users` quando o código confere em `POST /auth/register/confirm`. Se o e-mail já tem conta, nada é gravado e o dono recebe um aviso. Os dois caminhos calculam os mesmos hashes, para o tempo de resposta não denunciar a diferença. Cadastros pendentes expiram com o código (15 minutos) e são apagados no próximo cadastro, para não guardar dados de quem não confirmou. Pelo mesmo motivo de proteger a conta, trocar o e-mail no perfil exige a senha atual.
