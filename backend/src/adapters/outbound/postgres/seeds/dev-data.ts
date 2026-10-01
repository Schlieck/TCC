import type { Knex } from 'knex';
import { calendarDateOf } from '../../../../domain/shared/calendar-date.js';
import { BcryptPasswordHasher } from '../../security/bcrypt-password-hasher.js';

const DEV_USER = {
  name: 'Usuário de Teste',
  email: 'teste@shifty.dev',
  password: 'Shifty123',
  phone: '49999990000',
  birthDate: '1995-06-15',
};

const CARD_GROUPS: Record<string, { name: string; description: string }[]> = {
  Ansiedade: [
    {
      name: 'Você não é seu pensamento',
      description: 'Pensamentos são hipóteses, não fatos. Quais são as evidências dessa crença?',
    },
    {
      name: 'Respiração 4-4-4',
      description: 'Inspire contando até 4, segure por 4 e solte em 4. Repita três vezes.',
    },
    {
      name: 'Pior, melhor e mais provável',
      description: 'Qual o pior cenário? E o melhor? Qual deles é o mais realista?',
    },
  ],
  Trabalho: [
    {
      name: 'Errar faz parte',
      description: 'Um erro não define minha competência. O que posso aprender com ele?',
    },
    {
      name: 'Uma coisa de cada vez',
      description: 'Escolha a próxima tarefa pequena e comece só por ela.',
    },
  ],
  Autocuidado: [
    {
      name: 'Pausa consciente',
      description: 'Pare por um minuto, observe cinco coisas ao redor e volte com calma.',
    },
    {
      name: 'Fale com alguém',
      description: 'Mandar uma mensagem para um amigo também é uma forma de se cuidar.',
    },
    {
      name: 'Durma antes',
      description: 'Cansaço aumenta pensamentos catastróficos. Descansar é parte do tratamento.',
    },
  ],
};

const SITUATIONS = [
  { title: 'Reunião no trabalho', description: 'Precisei apresentar um resultado e travei.' },
  { title: 'Mensagem sem resposta', description: 'Mandei mensagem e demoraram para responder.' },
  { title: 'Prova da faculdade', description: 'Achei que ia esquecer tudo na hora da prova.' },
  { title: 'Almoço em família', description: 'Um comentário sobre meu emprego me incomodou.' },
  { title: 'Trânsito antes da consulta', description: 'Fiquei com medo de chegar atrasado.' },
  { title: 'Feedback do chefe', description: 'Recebi uma crítica e passei o dia pensando nela.' },
  { title: 'Caminhada no parque', description: 'Consegui sair de casa e me senti mais leve.' },
  { title: 'Conversa com amiga', description: 'Contei como estava e fui bem acolhido.' },
  { title: 'Noite sem dormir', description: 'Fiquei repassando as tarefas do dia seguinte.' },
  { title: 'Tarefa entregue', description: 'Terminei algo que vinha adiando há semanas.' },
];

/** Intensidade média esperada no início e no fim do período, para os gráficos terem tendência. */
const TRENDS: Record<string, { start: number; end: number; chance: number }> = {
  anxiety: { start: 80, end: 35, chance: 0.85 },
  sadness: { start: 60, end: 25, chance: 0.5 },
  fear: { start: 55, end: 30, chance: 0.3 },
  guilt: { start: 45, end: 20, chance: 0.2 },
  anger: { start: 35, end: 25, chance: 0.15 },
  shame: { start: 40, end: 15, chance: 0.15 },
  joy: { start: 20, end: 65, chance: 0.6 },
  relief: { start: 15, end: 60, chance: 0.5 },
};

const DAYS_OF_HISTORY = 210;

/** Recria o usuário de teste do zero; o ON DELETE CASCADE leva junto os dados antigos dele. */
export async function seed(knex: Knex): Promise<void> {
  await knex('users').where({ email: DEV_USER.email }).delete();
  const [user] = await knex('users')
    .insert({
      name: DEV_USER.name,
      email: DEV_USER.email,
      password_hash: await new BcryptPasswordHasher(10).hash(DEV_USER.password),
      phone: DEV_USER.phone,
      birth_date: DEV_USER.birthDate,
      privacy_consent_at: knex.fn.now(),
    })
    .returning<{ id: number }[]>('id');
  if (!user) {
    throw new Error('Could not create the dev user');
  }

  await seedCopingCards(knex, user.id);
  await seedThoughtRecords(knex, user.id);
}

async function seedCopingCards(knex: Knex, userId: number): Promise<void> {
  for (const [groupName, cards] of Object.entries(CARD_GROUPS)) {
    const [group] = await knex('coping_card_groups')
      .insert({ user_id: userId, name: groupName })
      .returning<{ id: number }[]>('id');
    if (!group) {
      throw new Error(`Could not create group ${groupName}`);
    }
    await knex('coping_cards').insert(
      cards.map((card) => ({ user_id: userId, group_id: group.id, ...card })),
    );
  }
}

async function seedThoughtRecords(knex: Knex, userId: number): Promise<void> {
  const random = mulberry32(2026);
  const emotionIds = new Map(
    (await knex('emotions').select<{ id: number; slug: string }[]>('id', 'slug')).map((row) => [
      row.slug,
      row.id,
    ]),
  );

  for (let daysAgo = DAYS_OF_HISTORY; daysAgo >= 0; daysAgo--) {
    // Em média 4 registros por semana.
    if (random() > 4 / 7) {
      continue;
    }
    const progress = 1 - daysAgo / DAYS_OF_HISTORY;
    const situation = pick(random, SITUATIONS);
    const [record] = await knex('thought_records')
      .insert({
        user_id: userId,
        title: situation.title,
        occurred_on: calendarDateOf(daysBefore(daysAgo)),
        occurred_time: `${String(7 + Math.floor(random() * 16)).padStart(2, '0')}:${String(
          Math.floor(random() * 60),
        ).padStart(2, '0')}`,
        description: situation.description,
      })
      .returning<{ id: number }[]>('id');
    if (!record) {
      throw new Error('Could not create a thought record');
    }

    const emotions = pickEmotions(random, progress, emotionIds);
    await knex('thought_record_emotions').insert(
      emotions.map((emotion) => ({ thought_record_id: record.id, ...emotion })),
    );
  }
}

function pickEmotions(
  random: () => number,
  progress: number,
  emotionIds: Map<string, number>,
): { emotion_id: number; intensity: number }[] {
  const picked = Object.entries(TRENDS)
    .filter(([, trend]) => random() < trend.chance)
    .map(([slug, trend]) => {
      const expected = trend.start + (trend.end - trend.start) * progress;
      const intensity = Math.round(Math.min(100, Math.max(0, expected + (random() - 0.5) * 30)));
      return { emotion_id: emotionIds.get(slug) ?? 0, intensity };
    })
    .filter((emotion) => emotion.emotion_id > 0);

  if (picked.length > 0) {
    return picked;
  }
  const anxiety = emotionIds.get('anxiety');
  return anxiety ? [{ emotion_id: anxiety, intensity: 50 }] : [];
}

function pick<T>(random: () => number, items: readonly T[]): T {
  const item = items[Math.floor(random() * items.length)];
  if (item === undefined) {
    throw new Error('Cannot pick from an empty list');
  }
  return item;
}

function daysBefore(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/** Gerador pseudoaleatório com semente fixa: o seed produz sempre os mesmos dados. */
function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
