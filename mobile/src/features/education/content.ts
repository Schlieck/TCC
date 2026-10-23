/**
 * Conteúdo educativo da aba "Aprenda!" (Figura 10), fixo no app.
 * Textos curtos baseados no capítulo 2 do relatório do TCC e em Beck (2014).
 * Cada tópico está marcado com TODO: revisar — revisar com o orientador antes dos testes.
 */

export type TopicSlug =
  | 'socratic-questioning'
  | 'beliefs'
  | 'core-belief-categories'
  | 'coping-cards'
  | 'judith-beck'
  | 'thought-records';

export type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'list'; items: string[] };

export interface EducationTopic {
  slug: TopicSlug;
  title: string;
  blocks: ContentBlock[];
}

export const EDUCATION_INTRO =
  'Quando seu terapeuta estiver longe, saber se defender sozinho de pensamentos disfuncionais pode te livrar de vários sentimentos desagradáveis :)';

export const EDUCATION_TOPICS: EducationTopic[] = [
  // TODO: revisar
  {
    slug: 'socratic-questioning',
    title: 'Questionamentos socráticos',
    blocks: [
      {
        type: 'paragraph',
        text: 'São perguntas que você faz a si mesmo para avaliar se um pensamento é verdadeiro e útil. Elas criam uma pequena distância entre você e o pensamento, plantando dúvidas sobre ideias que pareciam absolutas.',
      },
      { type: 'heading', text: 'Experimente perguntar' },
      {
        type: 'list',
        items: [
          'De onde vem essa crença? Quais são as evidências a favor e contra ela?',
          'Ela já se provou verdadeira antes?',
          'Existe outra forma de enxergar essa situação?',
          'Qual é o pior cenário? E o melhor? Qual é o mais provável?',
          'Se o pior acontecer, o que eu poderia fazer?',
        ],
      },
      {
        type: 'paragraph',
        text: 'Comparar os cenários ajuda a "descatastrofizar": reduzir o problema à sua forma mais provável, que costuma ser bem mais fácil de encarar.',
      },
    ],
  },
  // TODO: revisar
  {
    slug: 'beliefs',
    title: 'Tipos de crenças',
    blocks: [
      {
        type: 'paragraph',
        text: 'Na TCC, a forma como interpretamos um acontecimento pesa tanto quanto o próprio acontecimento: ela muda o que sentimos e o que fazemos. Essas interpretações vêm de pensamentos e crenças em diferentes níveis.',
      },
      { type: 'heading', text: 'Pensamentos automáticos' },
      {
        type: 'paragraph',
        text: 'Surgem de repente, são rápidos e passageiros, e quase nunca são questionados. Por isso podem ser confundidos com fatos.',
      },
      { type: 'heading', text: 'Crenças intermediárias' },
      {
        type: 'list',
        items: [
          'Atitudes: o que você considera aceitável ou não ("é terrível não ser produtivo").',
          'Regras: obrigações que você se impõe ("eu devo ser produtivo").',
          'Pressupostos: hipóteses do tipo "se… então…" ("se eu desistir, não mereço ser feliz").',
        ],
      },
      { type: 'heading', text: 'Crenças nucleares' },
      {
        type: 'paragraph',
        text: 'São ideias tão fortes sobre você, os outros ou o mundo que parecem verdades absolutas, como "sou incompetente". Funcionam como lentes: rígidas e generalizadas, influenciam como você interpreta tudo o que acontece.',
      },
    ],
  },
  // TODO: revisar — o capítulo 2 não trata deste tópico. Na tradução de Beck as categorias
  // aparecem como "desamparo, desamor e desvalor"; o mockup usa "desafeto".
  {
    slug: 'core-belief-categories',
    title: 'Desvalor, desafeto e desamparo',
    blocks: [
      {
        type: 'paragraph',
        text: 'Segundo Judith Beck, as crenças nucleares negativas costumam se agrupar em três temas. Reconhecer o tema por trás de um pensamento ajuda a entender por que ele dói tanto.',
      },
      { type: 'heading', text: 'Desamparo' },
      {
        type: 'paragraph',
        text: 'Crenças de incapacidade ou fraqueza: "não dou conta", "sou incompetente", "estou sem saída".',
      },
      { type: 'heading', text: 'Desafeto (ou desamor)' },
      {
        type: 'paragraph',
        text: 'Crenças de não ser amado ou aceito: "ninguém gosta de mim", "vou acabar sozinho", "sou diferente dos outros".',
      },
      { type: 'heading', text: 'Desvalor' },
      {
        type: 'paragraph',
        text: 'Crenças de não ter valor: "não mereço nada de bom", "sou uma pessoa ruim", "sou um fardo".',
      },
      {
        type: 'paragraph',
        text: 'Essas crenças não são verdades, mesmo quando parecem. Converse com seu terapeuta sobre as que aparecem com mais frequência nos seus registros.',
      },
    ],
  },
  // TODO: revisar
  {
    slug: 'coping-cards',
    title: 'Cartões de enfrentamento',
    blocks: [
      {
        type: 'paragraph',
        text: 'São pequenos lembretes, escritos ou digitais, com o que você quer lembrar quando um pensamento automático difícil aparecer. Podem trazer frases como "você não é seu pensamento" ou perguntas como "quais são as evidências dessa crença?".',
      },
      { type: 'heading', text: 'Como usar' },
      {
        type: 'list',
        items: [
          'Leia seus cartões todos os dias, de preferência pela manhã.',
          'Volte a eles nos momentos em que sentir que está tendo uma recaída.',
          'Organize os cartões em grupos (por exemplo, "Ansiedade" ou "Trabalho") para achar o certo na hora.',
          'Crie cartões junto com seu terapeuta e ajuste o texto até ele fazer sentido para você.',
        ],
      },
    ],
  },
  // TODO: revisar — o mockup pergunta "Quem foi", mas Judith Beck está viva; talvez a intenção
  // fosse falar de Aaron T. Beck (1921–2021). Texto escrito sem apoio do capítulo 2.
  {
    slug: 'judith-beck',
    title: 'Quem é Judith S. Beck?',
    blocks: [
      {
        type: 'paragraph',
        text: 'Judith S. Beck é uma psicóloga norte-americana e uma das principais referências da Terapia Cognitivo-Comportamental. Ela é filha de Aaron T. Beck, psiquiatra que criou a terapia cognitiva nos anos 1960.',
      },
      {
        type: 'paragraph',
        text: 'Judith preside o Beck Institute for Cognitive Behavior Therapy, nos Estados Unidos, que forma terapeutas no mundo todo. É autora do livro "Terapia cognitivo-comportamental: teoria e prática", usado como base deste aplicativo.',
      },
      {
        type: 'paragraph',
        text: 'No livro, ela descreve o modelo cognitivo: não são só os acontecimentos que nos afetam, mas a forma como os interpretamos. Dois leitores do mesmo livro podem sentir coisas opostas, dependendo do que pensam sobre ele.',
      },
    ],
  },
  // TODO: revisar
  {
    slug: 'thought-records',
    title: 'A importância do registro de pensamentos',
    blocks: [
      {
        type: 'paragraph',
        text: 'O registro de pensamentos é uma espécie de diário estruturado: você anota o que aconteceu, o que pensou, o que sentiu e o que fez. Com o tempo, essa cadeia de eventos, pensamentos e reações fica mais clara.',
      },
      { type: 'heading', text: 'Para que serve' },
      {
        type: 'list',
        items: [
          'Avaliar se seus pensamentos são verdadeiros e úteis.',
          'Reconhecer padrões que se repetem.',
          'Desenvolver respostas melhores para situações parecidas.',
          'Levar exemplos concretos para a consulta.',
        ],
      },
      {
        type: 'paragraph',
        text: 'Dar uma porcentagem para cada sentimento torna o impacto dos pensamentos ainda mais evidente, para você e para seu terapeuta. No Shifty, essas porcentagens viram os gráficos da aba Relatórios.',
      },
    ],
  },
];

export function findTopic(slug: string): EducationTopic | undefined {
  return EDUCATION_TOPICS.find((topic) => topic.slug === slug);
}
