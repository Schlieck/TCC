# Shifty

Aplicativo mobile de apoio à Terapia Cognitivo-Comportamental, desenvolvido como Trabalho de Conclusão de Curso em Ciência da Computação (Unochapecó). O app ajuda o paciente a registrar pensamentos e emoções, usar cartões de enfrentamento e acompanhar a evolução do humor em relatórios para levar às consultas.

> O Shifty **não substitui** atendimento profissional, não faz diagnóstico e não dá recomendação clínica. Em crise, ligue para o CVV (188) ou para o SAMU (192).

O relatório do TCC I está em [docs/relatorio-tcc1.pdf](docs/relatorio-tcc1.pdf).

## Como funciona

- **Login** (e-mail e senha) pelo Firebase Authentication. A conta só é liberada depois que o e-mail é confirmado pelo link enviado no cadastro.
- **Dados** (perfil, registros, cartões, relatórios) ficam **só no aparelho**, num banco SQLite, separados por usuário. Não há servidor próprio nem cópia na nuvem: desinstalar o app ou trocar de celular apaga os registros.

## Estrutura

| Pasta | Conteúdo |
|---|---|
| [mobile/](mobile/) | App React Native com Expo SDK 57, executado pelo Expo Go |
| [docs/](docs/) | Relatório do TCC, [glossário](docs/glossario.md), [decisões de arquitetura](docs/decisoes-de-arquitetura.md) e [relatório de testes](docs/relatorio-de-testes.md) |

## Pré-requisitos

- Git
- Node.js 22.13 ou superior (desenvolvido com Node 24 LTS)
- Celular Android 9+ ou iPhone com iOS 16.4+, com o app **Expo Go** instalado, na mesma rede Wi-Fi do computador (ou um emulador Android)
- Um projeto no [Console do Firebase](https://console.firebase.google.com/)

## Configurar o Firebase

1. No Console do Firebase, crie um projeto e registre um **app Web** (ícone `</>`).
2. Em **Authentication → Método de login**, ative **E-mail/senha**.
3. Copie os valores do `firebaseConfig` do app Web (Configurações do projeto → Seus apps) para `mobile/.env`, a partir do `mobile/.env.example`:

   ```bash
   cd mobile
   cp .env.example .env
   ```

   | Variável | Campo do `firebaseConfig` |
   |---|---|
   | `EXPO_PUBLIC_FIREBASE_API_KEY` | `apiKey` |
   | `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | `authDomain` |
   | `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | `projectId` |
   | `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | `storageBucket` |
   | `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
   | `EXPO_PUBLIC_FIREBASE_APP_ID` | `appId` |

Esses valores identificam o projeto e não são segredo (vão dentro do app), mas o `.env` não é versionado. Se faltar algum, o app abre numa tela "Configuração incompleta" dizendo qual.

Os e-mails de confirmação, de redefinição de senha e de troca de e-mail são enviados pelo próprio Firebase, em português. Podem cair no spam.

## Como rodar

```bash
git clone https://github.com/Schlieck/TCC.git
cd TCC/mobile
npm install
cp .env.example .env      # preencha com os dados do Firebase
npm run dev
```

Abra o Expo Go no celular e escaneie o QR code mostrado no terminal. No emulador Android, use `npx expo start --android`; se o Expo Go não conectar, rode `adb reverse tcp:8081 tcp:8081` e abra `exp://127.0.0.1:8081`.

Não há usuário de teste pronto: crie uma conta com um e-mail que você consiga abrir, para clicar no link de confirmação.

## Gerar o APK de teste

O APK é gerado na nuvem pelo EAS Build (perfil `preview` do [mobile/eas.json](mobile/eas.json)), com uma conta no [expo.dev](https://expo.dev). Na pasta `mobile/`:

```bash
npx eas-cli@latest login
npx eas-cli@latest init                       # só na primeira vez: liga o projeto à sua conta
npx eas-cli@latest env:push preview --path .env
npx eas-cli@latest build -p android --profile preview
```

- O `eas init` grava o `extra.eas.projectId` no `app.json`; faça commit dessa mudança.
- O EAS Build não envia o `.env` (ele é ignorado pelo git): o `env:push` copia as variáveis `EXPO_PUBLIC_FIREBASE_*` para o ambiente `preview` do EAS, que o perfil `preview` usa. Repita sempre que mudar o `.env`. Para conferir: `npx eas-cli@latest env:list preview`.
- Ao fim do build, o terminal mostra um link e um QR code para baixar o APK. No celular, permita instalar apps de fontes desconhecidas.

## Scripts (em `mobile/`)

| Comando | O que faz |
|---|---|
| `npm run dev` | ambiente de desenvolvimento (Expo) |
| `npm run build` | gera o bundle Android localmente (teste de fumaça) |
| `npm run typecheck` | checagem de tipos |
| `npm run lint` | ESLint |
| `npm test` | testes (Vitest) da lógica pura e do esquema do banco |
