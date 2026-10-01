# Shifty

Aplicativo mobile de apoio à Terapia Cognitivo-Comportamental, desenvolvido como Trabalho de Conclusão de Curso em Ciência da Computação (Unochapecó). O app ajuda o paciente a registrar pensamentos e emoções, usar cartões de enfrentamento e acompanhar a evolução do humor em relatórios para levar às consultas.

> O Shifty **não substitui** atendimento profissional, não faz diagnóstico e não dá recomendação clínica. Em crise, ligue para o CVV (188) ou para o SAMU (192).

O relatório do TCC I está em [docs/relatorio-tcc1.pdf](docs/relatorio-tcc1.pdf).

## Estrutura

| Pasta | Conteúdo |
|---|---|
| [backend/](backend/) | API REST em Node.js + Express + PostgreSQL (TypeScript, arquitetura hexagonal) |
| [mobile/](mobile/) | App React Native com Expo SDK 57, executado pelo Expo Go |
| [docs/](docs/) | Relatório do TCC, [glossário](docs/glossario.md) e [decisões de arquitetura](docs/decisoes-de-arquitetura.md) |

## Pré-requisitos

- Node.js 22.13 ou superior (desenvolvido com Node 24)
- PostgreSQL local (gerenciado pelo pgAdmin)
- Celular Android 9+ ou iPhone com iOS 16.4+, com o app **Expo Go** instalado
- Computador e celular **na mesma rede Wi-Fi**

## Como rodar

### 1. Banco de dados

No pgAdmin, crie dois bancos vazios com o seu usuário do Postgres como dono:

- `shifty`: desenvolvimento
- `shifty_test`: testes de integração (os testes apagam os dados dele a cada execução)

O Knex cria as tabelas, mas não cria os bancos.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env      # preencha DB_USER, DB_PASSWORD e JWT_SECRET
npm run migrate           # cria as tabelas no banco shifty
npm run seed              # opcional: usuário de teste e dados para os gráficos
npm run dev
```

Para gerar o `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

Ao subir, o servidor mostra no terminal a URL que o celular deve usar, por exemplo `EXPO_PUBLIC_API_URL=http://192.168.1.10:3333/api`.

### 3. App

```bash
cd mobile
npm install
cp .env.example .env      # coloque o IP do seu computador em EXPO_PUBLIC_API_URL
npm run dev
```

Abra o Expo Go no celular e escaneie o QR code mostrado no terminal.

## Por que não `localhost`?

No Expo Go, o app roda **no celular**. Para o celular, `localhost` é o próprio celular, e não o seu computador. Por isso:

- o backend escuta em `0.0.0.0` (todas as interfaces de rede), não só em `127.0.0.1`;
- o app chama a API pelo **IP do computador na rede local**, definido em `EXPO_PUBLIC_API_URL` no arquivo `mobile/.env`.

Para descobrir o IP no Windows, rode `ipconfig` e procure "Endereço IPv4" do adaptador conectado à rede (por exemplo, `192.168.1.10`). Se o roteador trocar o IP do computador, atualize o `mobile/.env` e reinicie o Expo com `npm run dev -- --clear`.

Se o celular não conseguir conectar:

1. Confirme que os dois aparelhos estão na mesma rede Wi-Fi (redes de visitante costumam isolar os aparelhos).
2. Na primeira vez que o Node abrir a porta, o Firewall do Windows pergunta se deve liberar o acesso: permita em **redes privadas**. Confira também se a sua rede Wi-Fi está marcada como **privada** nas configurações do Windows.
3. Abra `http://<IP>:3333/api/health` no navegador do celular. Se aparecer `{"status":"ok","database":"up"}`, a rede está funcionando.

## Scripts

| Backend | Mobile | O que faz |
|---|---|---|
| `npm run dev` | `npm run dev` | ambiente de desenvolvimento |
| `npm run build` | `npm run build` | compila a API / gera o bundle Android (teste de fumaça) |
| `npm run typecheck` | `npm run typecheck` | checagem de tipos |
| `npm run lint` | `npm run lint` | ESLint |
| `npm test` | `npm test` | testes (Vitest) |
| `npm run migrate` | | aplica as migrations |
| `npm run seed` | | popula o banco de desenvolvimento |

Os testes de integração do backend usam o banco `shifty_test`. Rode `npm run test:unit` para executar só os testes que não precisam de banco.
