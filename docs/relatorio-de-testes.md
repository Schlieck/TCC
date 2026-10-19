# Relatório de testes do Shifty

Data: 17/10/2026. Escopo: backend (API) e app no emulador Android (AVD Pixel_8, Android 17, Expo Go, SDK 57).

As capturas citadas estão em `C:\Users\bruno\AppData\Local\Temp\claude\c--Users-bruno-TCC\d7903c37-4e10-4b33-9bad-b2581351273f\scratchpad\shots\` (pasta temporária, fora do repositório). O script dos testes de API e o log do backend estão na pasta-mãe (`api-test.mjs`, `api-results.json`, `backend.log`).

## Resumo

| # | Gravidade | Problema |
|---|---|---|
| 1 | Alto | Navegar para uma tela interna de outra aba deixa a aba presa nessa tela; o menu de Registros e a grade de Aprender ficam inalcançáveis até reiniciar o app |
| 2 | Médio | Cada registro ou cartão criado pela lista empilha mais uma cópia da lista; "Voltar" precisa de vários toques |
| 3 | Médio | Se os sentimentos não carregam no formulário de registro, não há como tentar de novo sem sair da tela e perder o que foi digitado |
| 4 | Baixo | API responde 500 para ids acima de 2.147.483.647 (12 rotas) |
| 5 | Baixo | Sessão encerrada por 401 volta ao login sem nenhuma mensagem |
| 6 | Baixo | Mensagem de erro de rede fala em "backend" para o paciente |
| 7 | Baixo | Rótulos inconsistentes: "Email" × "E-mail", "Data de aniversário" × "Data de nascimento" |
| 8 | Baixo | Data de nascimento no futuro mostra mensagem de formato inválido |
| 9 | Baixo | Eixo Y do gráfico às vezes aparece como "100.0%" (decimal e ponto) |
| 10 | Baixo | Cores muito parecidas no gráfico (Vergonha × Raiva, Culpa × Alívio) |
| 11 | Baixo | Rota inexistente em `/api` sem token responde 401 em vez de 404 |

Verificações automáticas: tudo passou (detalhes no fim).

## Problemas

### 1. Aba presa numa tela interna após navegação entre abas — Alto

**Passos (reproduzido):**
1. No Início, tocar em "Registrar pensamento" (abre "Novo registro" na aba Registros).
2. Tocar na seta "Voltar": vai para o Início.
3. Tocar na aba "Registros".

**Esperado:** o menu de Registros ("Fazer novo registro", "Verificar seus registros").
**Obtido:** a aba abre de novo o formulário "Novo registro" (com o rascunho anterior). "Voltar" leva ao Início, tocar outra vez na aba não volta ao menu. O menu e a lista de registros só voltam a ser alcançáveis pela aba depois de reiniciar o app.

O mesmo acontece com "O que é e pra que serve?" no menu de Registros: o tópico abre na aba Aprender, "Voltar" vai para o Início e a aba Aprender passa a mostrar sempre o tópico, sem acesso à grade de tópicos.

**Capturas:** `s20-atalho-registrar.png`, `s21-aba-registros.png`, `s38-oque-e.png`, `s39-aprender-preso.png`.

**Arquivos suspeitos:** chamadas `router.navigate` para telas internas de outra aba:
- `mobile/src/features/home/screens/home-screen.tsx:13` (reproduzido)
- `mobile/src/features/thought-records/screens/thought-records-menu-screen.tsx:12` (reproduzido)
- `mobile/src/features/coping-cards/screens/coping-cards-menu-screen.tsx:12` ("O que são?", mesmo padrão, não executado no app)
- `mobile/src/features/reports/screens/reports-screen.tsx:68` (botão "Fazer novo registro" do estado vazio, mesmo padrão, não executado no app)

Os `_layout.tsx` das abas declaram `unstable_settings = { initialRouteName: 'index' }` justamente para o menu ficar embaixo na pilha, mas no expo-router 57 essa âncora só é aplicada em deep links ou quando a navegação passa `{ withAnchor: true }`. Causa provável, não confirmada com correção.

### 2. Lista duplicada na pilha ao criar registro ou cartão — Médio

**Passos (reproduzido):**
1. Registros → "Verificar seus registros" → "+ Novo registro" → preencher → "Salvar". Repetir uma segunda vez.
2. Tocar em "Voltar" na lista.

**Esperado:** um toque volta ao menu de Registros.
**Obtido:** a lista reaparece; foram precisos 3 toques para chegar ao menu. O mesmo ocorre em Cartões ("+ Novo cartão" na lista): após criar 2 cartões, 3 toques.

**Capturas:** `s28-apos-salvar.png`, `s53-lista-cartoes.png` (o efeito é na pilha, não visível numa captura única).

**Arquivos suspeitos:** `router.replace('/thought-records/list')` em `mobile/src/features/thought-records/screens/new-thought-record-screen.tsx:26` e `router.replace('/coping-cards/list')` em `mobile/src/features/coping-cards/screens/new-coping-card-screen.tsx:15`. Quando o formulário foi aberto a partir da lista, a pilha `[menu, lista, novo]` vira `[menu, lista, lista]`. Pelo menu ("Fazer novo registro"/"Criar novo cartão") o comportamento está correto.

### 3. Sentimentos sem "Tentar novamente" no formulário de registro — Médio

**Passos (reproduzido):**
1. Logar, ativar o modo avião, abrir Registros → "Fazer novo registro" (primeira vez que a lista de sentimentos é buscada nessa sessão).
2. Desativar o modo avião e esperar 25 s.

**Esperado:** um botão para tentar de novo, ou a lista carregar sozinha quando a rede volta.
**Obtido:** a seção Sentimentos mostra só a mensagem de erro, sem botão, e não se recupera. Não dá para salvar ("Adicione pelo menos um sentimento."). A única saída é sair da tela, e "Descartar"/voltar descartam o texto digitado sem perguntar.

**Capturas:** `s92-salvar-offline.png`, `s93-apos-voltar-rede.png`.

**Arquivo suspeito:** `mobile/src/features/thought-records/components/emotion-intensity-editor.tsx:54-55` (ramo `emotions.isError` sem `refetch`). O app também não liga o `onlineManager` do TanStack Query à conectividade, por isso nada refaz a busca ao voltar a rede.

Obs.: com os sentimentos já carregados, salvar sem rede mostra o erro e mantém os dados do formulário (`s94-salvar-offline-com-emocao.png`), o que está correto.

### 4. API responde 500 para ids fora do intervalo do `integer` — Baixo

**Passos (reproduzido):** com um token válido, `GET /api/thought-records/3000000000`.

**Esperado:** 404 (ou 400).
**Obtido:** 500 `INTERNAL_ERROR`; o log registra `o valor "3000000000" está fora do intervalo para o tipo de dados integer`.

Rotas afetadas (todas testadas): GET/PUT/DELETE `/thought-records/:id`, GET/PUT/DELETE `/coping-cards/:id`, `GET /coping-cards?groupId=`, `POST /coping-cards` com `groupId` grande, PATCH/DELETE `/coping-card-groups/:id`, GET/DELETE `/saved-reports/:id`. `emotionId` grande já responde 400 corretamente.

**Arquivos suspeitos:** `backend/src/adapters/inbound/http/schemas/common-schemas.ts` (`idParamsSchema` sem limite máximo) e `groupId` em `backend/src/adapters/inbound/http/schemas/coping-card-schemas.ts` (`cardBodySchema` e `cardListQuerySchema`).

### 5. Fim de sessão por 401 sem aviso — Baixo

**Passos (reproduzido):** logado no app, trocar a senha do mesmo usuário pela API (o token do app deixa de valer) e puxar a lista para atualizar.

**Esperado:** voltar ao login com uma mensagem como "Sua sessão expirou. Faça login novamente." (texto que a API já devolve).
**Obtido:** volta ao login corretamente, mas sem nenhuma mensagem.

**Captura:** `s78-apos-401.png`. **Arquivos suspeitos:** `mobile/src/features/auth/auth-context.tsx` (`onUnauthorized` → `signOut`) e `mobile/src/features/auth/screens/login-screen.tsx`.

### 6. Mensagem de erro de rede com termo técnico — Baixo

**Passos (reproduzido):** modo avião e abrir qualquer tela que busque dados.

**Esperado:** texto para o paciente, ex.: "Sem conexão com o servidor. Verifique sua internet e tente novamente."
**Obtido:** "Não foi possível conectar ao servidor. Verifique se o backend está rodando e se o celular está na mesma rede Wi-Fi."

**Captura:** `s91-erro-rede-relatorio.png`. **Arquivo:** `mobile/src/shared/api/errors.ts:21`.

### 7. Rótulos inconsistentes — Baixo

- Login: placeholder "Email"; Ajustes: "Email:"; cadastro, "Esqueci a senha" e mensagens: "E-mail".
- Ajustes: "Data de aniversário:"; cadastro: "Data de nascimento".

**Capturas:** `s12-login.png`, `s10-ajustes.png`, `s15-cadastro.png`. **Arquivos:** `mobile/src/features/auth/screens/login-screen.tsx:45`, `mobile/src/features/account/components/profile-form.tsx:50` e `:65`.

### 8. Data de nascimento no futuro com mensagem de formato — Baixo

**Passos (reproduzido):** no cadastro ou em Ajustes, digitar `31/12/2099`.

**Esperado:** "A data de nascimento precisa estar no passado." (ou similar).
**Obtido:** "Informe uma data válida no formato DD/MM/AAAA.", embora o formato esteja certo.

**Captura:** `s72-perfil-erros.png`. **Arquivo:** `mobile/src/shared/forms/fields.ts:21` (uma única mensagem para formato e data futura).

### 9. Eixo Y com decimais — Baixo

**Passos (reproduzido):** usuário com um único registro no mês; Relatórios → Mês.

**Esperado:** "100%", "75%"... (como aparece para o usuário do seed e no PDF).
**Obtido:** "100.0%", "75.0%"..., com ponto decimal (padrão en-US).

**Capturas:** `s54-relatorios.png` (com decimais) × `s88-seed-mes.png` (sem). **Arquivo:** `mobile/src/features/reports/components/emotion-trend-chart.tsx:83-100` (o `LineChart` não define formatação dos rótulos do eixo Y; a biblioteca escolhe casas decimais conforme os dados).

### 10. Cores parecidas no gráfico — Baixo

Com todas as emoções no gráfico (usuário do seed, Ano), Vergonha (`#d55181`) e Raiva (`#e66767`) e também Culpa (`#008300`) e Alívio (`#199e70`) são difíceis de distinguir, principalmente para daltônicos. A tabela ("Ver os números em tabela") ameniza.

**Captura:** `s89-seed-ano.png`. **Arquivo:** `mobile/src/shared/theme/index.ts:66-75`.

### 11. 401 para rota inexistente — Baixo

**Passos (reproduzido):** `GET /api/nao-existe` sem token.
**Esperado:** 404 `ROUTE_NOT_FOUND` (é o que acontece com token).
**Obtido:** 401 `MISSING_TOKEN`, porque o middleware de autenticação vale para todo `/api` antes das rotas.

**Arquivo:** `backend/src/adapters/inbound/http/create-app.ts:70`. Impacto só cosmético.

## Observações (não são bugs, mas valem decisão)

- **Troca de e-mail sem confirmação:** `PATCH /me` troca o e-mail sem pedir a senha atual nem um código. Quem pegar o celular desbloqueado pode trocar o e-mail e depois usar "Esqueci a senha" para tomar a conta.
- **Enumeração de contas:** o cadastro responde 409 "Este e-mail já está cadastrado", enquanto o "Esqueci a senha" esconde se o e-mail existe. É comum e difícil de evitar no cadastro, mas a proteção do outro fluxo fica parcial.
- **Formulários descartam sem confirmação:** "Descartar" e o voltar do Android saem do formulário preenchido sem perguntar.
- **Teclado cobre o botão "Criar grupo"** no formulário de cartão enquanto se digita o nome do grupo (o campo continua visível; `s45-teclado-grupo.png`).
- **Excluir grupo com cartões:** a tela já sabe que o grupo tem "1 cartão", mas só avisa depois da confirmação, pelo erro da API (`s49-erro-grupo-nao-vazio.png`).
- **Sair não revoga o token no servidor:** só apaga o token do aparelho; ele continua válido até expirar (7 dias). Normal para JWT sem lista de revogação.

## O que foi testado e passou

**Verificações automáticas**

| Pacote | typecheck | lint | test | build |
|---|---|---|---|---|
| backend | ok | ok | ok (20 arquivos, 164 testes) | — |
| mobile | ok | ok | ok (11 arquivos, 57 testes) | ok (`expo export` Android) |

**API** (167 verificações, 165 passaram; as 2 falhas são o problema 4)
- Auth: cadastro (201, e-mail normalizado para minúsculas, sem hash na resposta), 400 para campos ausentes, senha fraca, sem consentimento, telefone e nascimento inválidos; 409 para e-mail duplicado (inclusive em cadastros simultâneos); 429 no 6º cadastro na hora. Login com e-mail em qualquer caixa; 401 para senha errada e e-mail inexistente; JSON malformado (400) e corpo > 100 kb (413).
- Recuperação de senha: mesma resposta 202 para e-mail cadastrado ou não; código errado (400); senha fraca não gasta o código; código certo troca a senha, derruba tokens antigos e devolve sessão; código não pode ser reutilizado; bloqueio na 5ª tentativa errada (429) e o código certo deixa de valer depois.
- Conta: `/me` sem campos sensíveis; PATCH com nome, e-mail, telefone e nascimento inválidos (400), e-mail de outro usuário (409), campos extras ignorados; troca de senha com senha atual errada, nova fraca e sem corpo (400), token antigo derrubado e novo válido; exclusão com código mal formatado, errado e de outro usuário (400), depois 204, token e login invalidados e dados apagados.
- Registros, emoções, grupos, cartões, tendência e relatórios salvos: caminho feliz, 400, 401 sem token/token inválido/adulterado/esquema errado e 404 para recurso de outro usuário em todas as rotas; grupo não vazio (409), nomes duplicados (409, sem diferenciar maiúsculas), período invertido e acima de 5 anos (400), filtros por período e por grupo, isolamento entre usuários na listagem e na tendência.
- Headers do helmet presentes.

**App no emulador**
- Login (vazio, e-mail inválido, senha errada, sucesso), cadastro (todas as validações e sucesso), "Esqueci a senha" (e-mail vazio, código errado, código do log, entra direto no app), sair.
- Início e os três atalhos (com o problema 1 no primeiro).
- Registros: estado vazio, criar com dois sentimentos e sliders, data pelo seletor, listar, filtros Todos/7 dias/30 dias/Escolher datas (inclusive datas invertidas, tratadas de propósito), detalhe, editar (título e remover sentimento), excluir com confirmação.
- Cartões: estado vazio, validações, criar grupo no formulário, criar cartão, filtro por grupo, renomear grupo (vazio e válido), excluir grupo com cartão (erro claro) e vazio, editar e mover cartão, excluir cartão.
- Aprender: os 6 tópicos abrem com o texto completo e "Voltar" retorna à grade.
- Relatórios: Semana, Mês, Ano, Personalizado, período anterior/próximo (sem passar do mês atual), toque no gráfico, tabela, estado vazio, salvar (nome vazio e válido), lista de salvos, abrir salvo (carrega o período), excluir salvo, PDF (folha de compartilhamento e prévia de impressão com cabeçalho, gráfico, tabela e aviso).
- Ajustes: editar perfil (validações, e-mail de outro usuário, sucesso), trocar senha (senha atual errada, nova fraca, confirmação diferente, sucesso mantendo a sessão), excluir conta (código errado, código certo, volta ao login).
- Textos em pt-BR (exceto os itens 6, 7 e 9), estados vazios, erro de rede com "Tentar novamente" nas listas, teclado não cobre os campos em cadastro, registro, cartão, troca de senha e modal de exclusão.
- Persistência: sessão e dados continuam após fechar e reabrir o Expo Go, inclusive depois da troca de senha; após excluir a conta o app abre no login.
- 401 encerra a sessão (sem mensagem, item 5).

**Segurança e privacidade**
- Log do backend (316 linhas, API e app): nenhum título, descrição, nome de cartão ou relatório, senha, token ou cabeçalho `Authorization`. E-mails só aparecem nas linhas `[e-mail simulado]`, junto com o código, que é a exceção prevista. Os erros 500 registram só a mensagem do Postgres (com o id), sem dados do usuário.
- Logcat do emulador sem tokens; as senhas que aparecem lá vêm dos meus comandos `adb input text`, não do app.
- Token guardado no `expo-secure-store`.
- Um usuário nunca viu, editou ou excluiu dados de outro (404 em todas as tentativas).

## O que não deu para testar

- iOS, aparelho físico e envio real de e-mail (SMTP).
- Expiração natural do JWT (7 dias); a invalidação por troca de senha e exclusão foi testada.
- Limite de tentativas de login e de pedido de código até o 429 (evitei bloquear o IP usado pelo app; o 429 de cadastro e o bloqueio por código errado foram testados).
- Compartilhar o PDF para outro app (só abri a folha de compartilhamento e a prévia de impressão).
- "O que são?" do menu de Cartões e o botão do estado vazio de Relatórios no app (mesmo código do problema 1, não executados).
- Estados de carregamento não foram capturados de forma sistemática (aparecem por instantes).
- Leitor de tela (TalkBack) e volume grande de dados.
- Fuso horário: o emulador está em GMT e o backend em UTC−3; casos perto da meia-noite não foram exercitados.

## Ambiente e efeitos colaterais

- Reiniciei o backend para conseguir ler o log: o `npm run dev` do terminal do Claude Desktop foi encerrado e um novo processo ficou rodando, com saída em `backend.log` na pasta temporária.
- No início o Expo Go mostrou "Failed to download remote update" (enquanto o backend reiniciava e o `expo export` rodava) e depois o aviso "Cannot connect to Expo CLI"; problema do ambiente de desenvolvimento, não do app. O seletor de data aparece em inglês porque o emulador está em inglês.
- Usuários de teste que ficaram no banco `shifty`: `qa-a-mvcmmwro@shifty.dev`, `qa-b-mvcmmwro@shifty.dev`, `qa-c-mvcmmwro@shifty.dev` e `qa-race-mvcojxyo@shifty.dev` (os usuários D e o do app foram excluídos pelo próprio fluxo). O usuário do seed não foi alterado: só fiz login e consultas, e o rascunho feito com ele foi descartado sem salvar.

## Atualização — correções (17/10/2026)

Todas as correções abaixo foram conferidas no emulador. As capturas desta etapa estão em `shots2\` (pasta irmã de `shots\`). Commits: `dd41c33`, `902c8e9`, `f1b14db`, `0de728e` e `3b6d00a`.

### Corrigido

| Item | Correção | Como foi conferido |
|---|---|---|
| Bug 1 | `router.navigate(..., { withAnchor: true })` nas 4 navegações entre abas | Atalho "Registrar pensamento" e "O que é"/"O que são?" voltam ao menu ou à grade; abas Registros, Cartões e Aprender continuam acessíveis (`r02-voltar-atalho.png`) |
| Bug 2 | `router.dismissTo(lista)` depois de criar registro ou cartão | Duas criações seguidas e um único "Voltar" chega ao menu, em Registros e em Cartões; pelo atalho do Início também |
| Bug 3 | "Tentar novamente" na seção Sentimentos | Sem rede aparece o botão; com a rede de volta, os sentimentos carregam (`r05-sentimentos-offline.png`, `r06-sentimentos-retry.png`) |
| Bug 6 | Mensagem de rede para o paciente: "Verifique sua conexão com a internet e tente novamente." | `r05-sentimentos-offline.png` |
| Bug 7 | "E-mail" e "Data de nascimento" em login, cadastro e Ajustes | Login e Ajustes no emulador |
| Bug 9 | Rótulos do eixo Y arredondados (`formatYLabel`) | Semana, Mês e Ano mostram "100%", "75%"... |
| Bug 10 | Tocar numa emoção da legenda destaca a linha (por cima, mais grossa) e deixa as outras em cinza; tocar de novo volta ao normal. A paleta validada foi mantida: com 8 emoções nenhuma combinação de cores separa todos os pares, e o método de visualização recomenda ênfase nesse caso | Usuário do seed, Ano, Raiva destacada (`r13-seed-destaque-raiva.png`) |
| Bug 11 | Autenticação aplicada só aos prefixos protegidos | Teste de integração; `GET /api/nao-existe` sem token responde 404 |
| Troca de e-mail | `PATCH /me` exige a senha atual quando o e-mail muda e passa a ter limite de tentativas; o perfil mostra o campo "Senha atual" só quando o e-mail é alterado | Sem senha, senha errada e senha certa no emulador (`r11-email-senha.png`, `r12-email-trocado.png`) |
| Enumeração de contas | Cadastro em dois passos: código por e-mail (`POST /auth/register` → 202, `POST /auth/register/confirm` → sessão). E-mail já cadastrado recebe só um aviso e a resposta é igual; cadastros não confirmados expiram com o código | No emulador: cadastro, "Corrigir dados" (mantém os dados), código errado e certo (`r01-codigo-cadastro.png`). Pela API: cadastro com o e-mail do seed responde 202, gera o aviso e a conta do seed continua igual |
| Descartar sem confirmação | Hook `useLeaveConfirmation` nos formulários de registro e de cartão (novo e edição). A causa era `formState.isDirty` lido só dentro da função, que o react-hook-form nunca atualiza | A seta, o voltar do Android e "Descartar" perguntam; "Cancelar" mantém o texto; salvar não pergunta; um 401 com o formulário alterado ainda leva ao login (`r03-confirma-descartar.png`, `r04-401-form-sujo.png`) |
| Teclado sobre "Criar grupo" | Botão ao lado do campo do novo grupo | `r07-grupo-teclado.png` |

### Não alterado (pendente)

- Bug 4: 500 para ids acima de 2.147.483.647 (12 rotas; confirmado de novo no log).
- Bug 5: fim de sessão por 401 sem mensagem.
- Bug 8: data de nascimento futura com mensagem de formato.
- Observações: excluir grupo com cartões só avisa depois da confirmação; sair não revoga o token no servidor.
- Residual da troca de e-mail: `PATCH /me` ainda responde 409 para e-mail de outra conta, mas só depois de conferir a senha e com limite de tentativas.
- O cadastro (dados ainda não enviados) não pede confirmação ao voltar; a confirmação foi aplicada aos formulários com botão "Descartar".

### Corrigido depois

| Item | Correção | Como foi conferido |
|---|---|---|
| Rótulos sobrepostos no gráfico | Função `placeDirectLabels` (`mobile/src/features/reports/direct-labels.ts`, com teste) posiciona os nomes ao lado das linhas sem sobreposição: acima do ponto e, se colidir, abaixo e cada vez mais longe | Usuário F, Mês: "Ansiedade" acima do ponto e "Alegria" abaixo (`r15-rotulos-sem-sobreposicao.png`) |
| Eixo X ilegível em períodos longos (achado no teste de volume) | Com 60 meses, a biblioteca cortava cada rótulo à largura do espaço entre pontos ("..."). Agora o rótulo exibido usa 52 px centralizados no ponto | Personalizado 01/01/2022–31/12/2026: "jan/22 … jul/26" legíveis (`r18-personalizado-longo.png` antes, `r21-personalizado-eixo.png` depois); Ano e Mês sem mudança visual (`r20-ano-eixo.png`) |
| Alvos de toque da legenda (achado na auditoria de acessibilidade) | Itens da legenda, que viraram botões no bug 10, tinham 18 dp de altura; agora têm 44 dp | Auditoria automática e toque no emulador (`r31-legenda-alvo.png`) |

## Testes complementares (o que faltava testar)

Feitos depois das correções, para cobrir a lista "O que não deu para testar".

| Item | Como | Resultado |
|---|---|---|
| E-mail por SMTP | Segunda instância temporária do backend (porta 3334) com `EMAIL_DRIVER=smtp` apontando para um servidor SMTP local que só grava as mensagens | Passou. Chegaram os 4 tipos de e-mail (cadastro, aviso de conta existente, redefinição e exclusão), com remetente configurado, assunto e corpo em UTF-8 e o código; os fluxos completos (cadastro, redefinição e exclusão) funcionaram com o código lido do e-mail. O aviso de conta existente não contém código. Nenhum código no log com SMTP |
| Expiração do token | Mesma instância com `JWT_EXPIRES_IN=8s` | Passou: depois de 9,5 s, `GET /me` responde 401 `INVALID_TOKEN` |
| Limites de tentativa | Mesma instância, IP próprio | Passou: login (429 na 11ª), pedido de código (6ª), confirmação de código (11ª), cadastro (6ª), confirmação de cadastro (11ª), `PATCH /me` com senha errada (11ª). A confirmação de cadastro divide o contador com as outras confirmações de código do mesmo IP |
| Volume grande | 1.100 registros em 3 anos para o usuário F, pela API | API: lista com 1.103 itens em 75 ms; tendência de 5 anos em 40 ms. App: lista abre e rola normalmente; filtros funcionam; relatório anual e personalizado de 5 anos funcionam (depois da correção do eixo X); PDF de 60 meses com 2 páginas e cabeçalho da tabela repetido, mas leva cerca de 11 s até abrir a folha de compartilhamento (`r22-pdf-longo.png`) |
| PDF para outro app | Compartilhar PDF → Messages | Passou: o app recebeu o arquivo (tela de destinatários); nada foi enviado (`r23-pdf-messages.png`) |
| "Fazer novo registro" no estado vazio de Relatórios | Período sem registros (2022) | Passou: abre o formulário e "Voltar" leva ao menu de Registros |
| "O que são?" (menu de Cartões) | No emulador | Passou: abre o tópico e "Voltar" leva à grade de Aprender |
| Estados de carregamento | Bloqueio temporário da tabela `users` no banco de desenvolvimento para segurar as respostas | Detalhe sem cache mostra o indicador centralizado (`r28-carregando-detalhe.png`); telas com cache mostram os dados enquanto atualizam. Achado: veja "Relatório mostra o período anterior" abaixo |
| Fuso horário | Emulador em GMT já em 18/10, servidor (UTC−3) ainda em 17/10 | **Falhou**: veja o bug novo abaixo |
| Acessibilidade | Auditoria automática dos elementos tocáveis (uiautomator) em Início, menus, listas, formulários, Relatórios, Ajustes e Aprender | Nenhum elemento tocável sem rótulo para leitor de tela. Vários alvos abaixo de 48 dp (lista em "Observações novas") |

### Bugs novos (corrigidos — veja "Correção dos bugs 12 e 13")

**12. Data de "hoje" recusada quando o aparelho está num fuso à frente do servidor — Médio**

- Passos: com o servidor em UTC−3 às 21h de 17/10 e o aparelho em GMT (já 18/10), abrir "Novo registro" e salvar com a data padrão.
- Esperado: o registro é salvo com a data do dia do usuário.
- Obtido: "A data do registro não pode estar no futuro." (`r30-fuso-data-futura.png`). O seletor de data também deixa escolher essa data, porque usa o "hoje" do aparelho.
- Acontece com quem está em fuso mais adiantado que o do servidor (por exemplo, servidor em Brasília e paciente em Fernando de Noronha ou em viagem) na faixa de horas em que as datas diferem.
- Arquivos: `backend/src/domain/thought-record/thought-record.ts` (`date > today`) e `backend/src/adapters/outbound/system-clock.ts` (`today()` no fuso do servidor). Sugestão: tolerar até um dia à frente do "hoje" do servidor, ou o app enviar o fuso.

**13. Ao trocar de período, o gráfico mostra o período anterior com o título novo — Baixo**

- Passos: rede lenta (reproduzido segurando a resposta por 7 s); Relatórios → Ano → "Período anterior".
- Esperado: indicação clara de carregamento, ou o gráfico do período anterior esmaecido.
- Obtido: o título já diz "2023", mas o gráfico e a legenda continuam com os dados de 2024 até a resposta chegar; o único sinal é um indicador pequeno no canto do cartão (`r29-carregando-ano.png`).
- Arquivo: `mobile/src/features/reports/hooks/use-reports.ts` (`placeholderData: keepPreviousData`) e `reports-screen.tsx`.

### Correção dos bugs 12 e 13

| Bug | Correção | Como foi conferido |
|---|---|---|
| 12 | A data do registro pode estar até um dia à frente do "hoje" do servidor, porque o "hoje" do paciente pode estar num fuso adiantado (`parseThoughtRecordContent`, vale para criar e editar). Datas mais adiante continuam recusadas | Teste unitário; API: hoje e amanhã → 201, depois de amanhã → 400 `FUTURE_RECORD_DATE`; no emulador em UTC+14 (20/10) com o servidor em 19/10, o registro com a data padrão foi salvo (`r33-fuso-corrigido.png`). O fuso do emulador voltou para GMT |
| 13 | Removido o `keepPreviousData` da tendência: ao trocar de período, o cartão mostra o indicador de carregamento em vez do gráfico do período anterior, e "Salvar relatório"/"Compartilhar PDF" só aparecem com os dados do período certo | Respostas seguradas por 12 s no banco: ao ir de 2026 para 2025, só o indicador aparece até o gráfico de 2025 chegar (`r32-troca-periodo-carregando.png`) |

Verificações depois das correções: typecheck, lint, Prettier e testes passando nos dois pacotes (backend 173, mobile 60).

### Observações novas

- **Alvos de toque pequenos** (o Android recomenda 48 dp; medidos sem o `hitSlop`): seta "Voltar" 24 dp (40 dp com o `hitSlop`), setas de período 28 dp, links CVV (188) e SAMU (192) 18 dp de altura, chips de filtro 30–38 dp, links "+ Novo registro"/"Descartar"/"Gerenciar grupos" 30 dp, botões "Editar/Excluir cartão" 27 dp, botões principais 44 dp. Os links de crise são os mais importantes de aumentar.
- **Lista de registros sem paginação**: com 1.103 registros, `GET /thought-records` devolve 271 KB de uma vez. Rápido no teste local, mas cresce sem limite.
- **PDF de período longo é lento** (cerca de 11 s com 60 meses e 8 emoções), sem indicação de progresso além do botão.
- **Primeiro rótulo do eixo X** encosta na borda esquerda em períodos longos ("jan/22" com o "j" levemente cortado).

### Não foi possível testar

- iOS e aparelho físico: não há aparelho nem macOS neste ambiente.
- Provedor SMTP real (Gmail, SendGrid…): faltam credenciais; o envio por SMTP foi testado contra um servidor local.
- Leitor de tela (TalkBack) de ponta a ponta: foi feita só a auditoria automática de rótulos e tamanhos de alvo.

### Efeitos colaterais desta etapa

- Nova migration `20261017000000_create_pending_registrations` aplicada em `shifty` e `shifty_test`.
- Usuário de teste do app: `qa-app-f1017b@shifty.dev` / `Senha4321` (e-mail trocado durante o teste).
- No Expo Go deste ambiente o recarregamento automático não funciona ("Cannot connect to Expo CLI"); depois de mudar o código, foi preciso reabrir o app.
- Testes complementares: uma segunda instância do backend (porta 3334) e um servidor SMTP local rodaram só durante os testes e foram encerrados. Ficaram no banco `shifty` 1.100 registros do usuário F (`Registro em massa N`) e o usuário de teste do SMTP foi excluído pelo próprio fluxo.
- Reteste dos bugs 12 e 13 (19/10): backend, Metro e emulador foram reiniciados (não estavam rodando). O usuário F ganhou mais 4 registros de teste ("Fuso +0", "Fuso +1", "Fuso adiantado", "Amanha no servidor").
