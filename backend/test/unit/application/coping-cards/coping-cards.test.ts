import { beforeEach, describe, expect, it } from 'vitest';
import { CreateCopingCard } from '../../../../src/application/use-cases/coping-cards/create-coping-card.js';
import { DeleteCopingCard } from '../../../../src/application/use-cases/coping-cards/delete-coping-card.js';
import { GetCopingCard } from '../../../../src/application/use-cases/coping-cards/get-coping-card.js';
import { ListCopingCards } from '../../../../src/application/use-cases/coping-cards/list-coping-cards.js';
import { UpdateCopingCard } from '../../../../src/application/use-cases/coping-cards/update-coping-card.js';
import { NotFoundError } from '../../../../src/domain/shared/errors.js';
import { InMemoryCopingCardGroupRepository } from '../../../support/in-memory/in-memory-coping-card-group-repository.js';
import { InMemoryCopingCardRepository } from '../../../support/in-memory/in-memory-coping-card-repository.js';

const ANA = 1;
const BIA = 2;

describe('coping cards', () => {
  let cards: InMemoryCopingCardRepository;
  let groups: InMemoryCopingCardGroupRepository;
  let createCard: CreateCopingCard;
  let anaGroupId: number;
  let biaGroupId: number;

  beforeEach(async () => {
    cards = new InMemoryCopingCardRepository();
    groups = new InMemoryCopingCardGroupRepository(cards);
    createCard = new CreateCopingCard(cards, groups);
    anaGroupId = (await groups.create(ANA, 'Ansiedade')).id;
    biaGroupId = (await groups.create(BIA, 'Sono')).id;
  });

  function cardFor(userId: number, groupId: number, name = 'Respire') {
    return createCard.execute({ userId, groupId, name, description: 'Inspire contando até 4.' });
  }

  it('creates a card in one of the user groups', async () => {
    const card = await createCard.execute({
      userId: ANA,
      groupId: anaGroupId,
      name: ' Você não é seu pensamento ',
      description: 'Quais são as evidências dessa crença?',
    });

    expect(card).toMatchObject({
      id: 1,
      groupId: anaGroupId,
      name: 'Você não é seu pensamento',
      description: 'Quais são as evidências dessa crença?',
    });
  });

  it('refuses a group that belongs to another user', async () => {
    await expect(cardFor(ANA, biaGroupId)).rejects.toMatchObject({
      code: 'INVALID_CARD_GROUP',
      field: 'groupId',
    });
    expect(cards.cards.size).toBe(0);
  });

  it.each([
    ['INVALID_CARD_NAME', { name: '' }],
    ['INVALID_CARD_DESCRIPTION', { description: '  ' }],
  ])('validates the content (%s)', async (code, overrides) => {
    await expect(
      createCard.execute({
        userId: ANA,
        groupId: anaGroupId,
        name: 'Nome',
        description: 'Descrição',
        ...overrides,
      }),
    ).rejects.toMatchObject({ code });
  });

  it('lists the user cards, optionally filtered by group', async () => {
    const workGroupId = (await groups.create(ANA, 'Trabalho')).id;
    await cardFor(ANA, anaGroupId, 'A');
    await cardFor(ANA, workGroupId, 'B');
    await cardFor(BIA, biaGroupId, 'C');
    const list = new ListCopingCards(cards);

    expect((await list.execute({ userId: ANA })).map((card) => card.name)).toEqual(['B', 'A']);
    expect(
      (await list.execute({ userId: ANA, groupId: workGroupId })).map((card) => card.name),
    ).toEqual(['B']);
  });

  it('updates a card, including moving it to another group', async () => {
    const workGroupId = (await groups.create(ANA, 'Trabalho')).id;
    const card = await cardFor(ANA, anaGroupId);

    const updated = await new UpdateCopingCard(cards, groups).execute({
      userId: ANA,
      cardId: card.id,
      groupId: workGroupId,
      name: 'Novo nome',
      description: 'Nova descrição',
    });

    expect(updated).toMatchObject({ groupId: workGroupId, name: 'Novo nome' });
  });

  it("hides another user's card from get, update and delete", async () => {
    const card = await cardFor(ANA, anaGroupId);
    const input = { userId: BIA, cardId: card.id };

    await expect(new GetCopingCard(cards).execute(input)).rejects.toThrow(NotFoundError);
    await expect(
      new UpdateCopingCard(cards, groups).execute({
        ...input,
        groupId: biaGroupId,
        name: 'x',
        description: 'y',
      }),
    ).rejects.toThrow(NotFoundError);
    await expect(new DeleteCopingCard(cards).execute(input)).rejects.toThrow(NotFoundError);
    expect(cards.cards.size).toBe(1);
  });

  it('deletes a card', async () => {
    const card = await cardFor(ANA, anaGroupId);

    await new DeleteCopingCard(cards).execute({ userId: ANA, cardId: card.id });

    expect(cards.cards.size).toBe(0);
  });
});
