# Glossário: termos do TCC ↔ código

| Termo no TCC (pt-BR) | Código (inglês) | Tabela (SQLite local) |
|---|---|---|
| Usuário / paciente | conta do Firebase Authentication, identificada pelo `uid` | — (no Firebase) |
| Perfil (nome, telefone, nascimento, consentimento) | `UserProfile` | `profiles` |
| Cartão de enfrentamento | `CopingCard` | `coping_cards` |
| Grupo de cartões | `CopingCardGroup` | `coping_card_groups` |
| Registro de pensamento | `ThoughtRecord` | `thought_records` |
| Sentimento / emoção | `Emotion` | `emotions` |
| Intensidade do sentimento (0–100%) | `intensity` em `EmotionIntensity` | `thought_record_emotions` |
| Relatório salvo | `SavedReport` | `saved_reports` |
| Evolução das emoções (gráfico do relatório) | `EmotionTrend` | — (calculado) |
| Confirmação do e-mail | `emailVerified` (Firebase), status `unverified` | — |
| Completar o cadastro neste aparelho | status `needsProfile` | — |
| Redefinição de senha ("Esqueci a senha") | `sendPasswordResetEmail` (link do Firebase) | — |
| Exclusão de conta | `deleteAccount` (senha atual) | — |
| Conteúdo educativo (aba Educação) | `education` (feature do app, conteúdo local) | — |
