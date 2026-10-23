# Decisões de arquitetura

Registro curto das decisões tomadas durante o desenvolvimento, com o motivo de cada uma.

## 1. Expo SDK 57 e requisitos mínimos (NF003)

O app roda no Expo Go, que nas lojas só abre projetos do SDK atual. O SDK 57 (React Native 0.86) exige **Android 7+ e iOS 16.4+**. O Android 9+ do NF003 continua atendido; o NF003 deve ser atualizado para **iOS 16.4+** no TCC II (o último SDK com iOS 15.1 foi o 55).

## 2. Backend em arquitetura hexagonal

Revogada pela decisão 11: o backend foi removido.

## 3. Knex sem ORM

Revogada pela decisão 11: o backend foi removido.

## 4. TypeScript 6.0 fixo

O TypeScript 7 é o mais recente, mas o typescript-eslint ainda só suporta versões abaixo de 6.1.

## 5. Monorepo sem workspaces

Revogada pela decisão 11: sem o backend, o repositório tem um único pacote (`mobile/`).

## 6. Datas como texto `YYYY-MM-DD`

Datas de calendário (data do registro, período do relatório) não têm fuso horário. No banco local elas ficam como texto `YYYY-MM-DD`, comparadas como texto e nunca convertidas para meia-noite UTC. O "hoje" é sempre o do aparelho.

## 7. Commits curtos, com prefixo e sem coautoria de IA

Princípio fundamental do repositório. Cada commit é pequeno (uma mudança coesa) e tem mensagem de uma linha no formato Conventional Commits: prefixo (`feat`, `fix`, `docs`, `test`, `refactor`, `chore`), escopo opcional (`mobile`) e descrição curta no imperativo, em inglês — por exemplo `feat(mobile): add thought records`. Sem corpo longo e **sem trailer `Co-Authored-By` nem qualquer menção ao Claude ou a outra IA**: a autoria do TCC é do aluno.

## 8. Relatórios calculados por função pura

A média de intensidade por emoção é calculada por uma função pura (`buildEmotionTrend`, em `mobile/src/features/reports/emotion-trend.ts`), testada sem banco. O agrupamento depende só do tamanho do período: até 14 dias, por dia; até 92 dias, em blocos de 7 dias a partir do início; acima disso, por mês de calendário. Assim semana → dia, mês → semana e ano → mês, e o mesmo vale para intervalos personalizados e relatórios salvos, que guardam só nome e período (o gráfico é sempre recalculado com os registros atuais).

## 9. Cores do gráfico

Cada emoção tem uma cor fixa, que acompanha a emoção e não a posição na lista. A paleta é a categórica de referência de visualização de dados (oito tons em ordem validada para daltonismo) e foi verificada com contraste mínimo de 3:1 sobre o fundo escuro do gráfico (`#262626`). Diferente da Figura 13, o gráfico usa fundo escuro para seguir o tema do app; legenda, tooltip e a tabela "Ver os números em tabela" garantem que a leitura não dependa só da cor.

## 10. Cadastro confirmado por e-mail

Revogada pela decisão 11: a confirmação do e-mail passou a ser feita pelo Firebase.

## 11. Firebase Auth + SQLite local, sem backend

Para a versão de teste com voluntários, o app passou a funcionar sem servidor próprio, que exigiria hospedar uma API e um banco com dados de saúde.

- **Login pelo Firebase Authentication** (e-mail e senha), com o SDK JavaScript `firebase`, que roda no Expo Go. A sessão fica persistida no AsyncStorage.
- **Dados só no aparelho**, em SQLite (`expo-sqlite`), separados pelo `uid` do Firebase. Toda consulta filtra pelo usuário logado, então dois usuários no mesmo aparelho não veem os dados um do outro. O esquema é versionado com `PRAGMA user_version`.
- **O backend foi apagado.** As regras de negócio dele (limites de tamanho, intensidade de 0 a 100, grupo obrigatório e do mesmo usuário, nome de grupo único por usuário, período com fim ≥ início e até 5 anos, política de senha) foram portadas para schemas zod no app, e a tendência de emoções (decisão 8), para uma função pura testada no Vitest.

Consequências:

- **Os dados não são recuperáveis.** Desinstalar o app, limpar os dados dele ou trocar de celular apaga os registros. Em outro aparelho a conta continua valendo, mas o paciente começa do zero e preenche o perfil de novo ("Complete seu cadastro"). O texto de consentimento avisa disso.
- **Verificação de e-mail obrigatória.** Enquanto o link enviado no cadastro não for aberto, o app só mostra a tela "Confirme seu e-mail".
- **Exclusão de conta pela senha atual** (reautenticação), em vez de código por e-mail. Os dados locais e a conta do Firebase são apagados na mesma transação: se o Firebase falhar (sem internet, por exemplo), nada é apagado.
- **Esqueci a senha e troca de e-mail por link do Firebase.** A troca de e-mail exige a senha atual e só vale depois do clique no link enviado ao novo endereço; em seguida o Firebase encerra a sessão e o paciente entra de novo com o novo e-mail.
- **O cadastro volta a revelar se um e-mail já tem conta** (resposta do Firebase). O "Esqueci a senha" continua respondendo igual nos dois casos.
- **Proteção local mais fraca que a do backend.** A sessão do Firebase fica no AsyncStorage, e não no Keystore, e o SQLite não é criptografado (o Expo Go não tem SQLCipher). Os dois ficam na área privada do app, mas não resistem a um aparelho com root.
