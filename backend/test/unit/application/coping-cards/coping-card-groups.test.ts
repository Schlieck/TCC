import { beforeEach, describe, expect, it } from 'vitest';
import { CreateCopingCardGroup } from '../../../../src/application/use-cases/coping-cards/create-coping-card-group.js';
import { DeleteCopingCardGroup } from '../../../../src/application/use-cases/coping-cards/delete-coping-card-group.js';
import { ListCopingCardGroups } from '../../../../src/application/use-cases/coping-cards/list-coping-card-groups.js';
import { RenameCopingCardGroup } from '../../../../src/application/use-cases/coping-cards/rename-coping-card-group.js';
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../../../../src/domain/shared/errors.js';
import { InMemoryCopingCardGroupRepository } from '../../../support/in-memory/in-memory-coping-card-group-repository.js';
import { InMemoryCopingCardRepository } from '../../../support/in-memory/in-memory-coping-card-repository.js';

const ANA = 1;
const BIA = 2;

describe('coping card groups', () => {
  let cards: InMemoryCopingCardRepository;
  let groups: InMemoryCopingCardGroupRepository;
  let createGroup: CreateCopingCardGroup;

  beforeEach(() => {
    cards = new InMemoryCopingCardRepository();
    groups = new InMemoryCopingCardGroupRepository(cards);
    createGroup = new CreateCopingCardGroup(groups);
  });

  it('creates a group with a trimmed name', async () => {
    await expect(createGroup.execute({ userId: ANA, name: '  Ansiedade ' })).resolves.toEqual({
      id: 1,
      name: 'Ansiedade',
    });
  });

  it('rejects an empty name', async () => {
    await expect(createGroup.execute({ userId: ANA, name: '   ' })).rejects.toThrow(
      ValidationError,
    );
  });

  it('rejects a duplicated name for the same user only', async () => {
    await createGroup.execute({ userId: ANA, name: 'Ansiedade' });

    await expect(createGroup.execute({ userId: ANA, name: 'ansiedade' })).rejects.toThrow(
      ConflictError,
    );
    await expect(createGroup.execute({ userId: BIA, name: 'Ansiedade' })).resolves.toBeDefined();
  });

  it('lists only the groups of the user, with their card counts', async () => {
    const work = await createGroup.execute({ userId: ANA, name: 'Trabalho' });
    await createGroup.execute({ userId: ANA, name: 'Ansiedade' });
    await createGroup.execute({ userId: BIA, name: 'Sono' });
    await cards.create(ANA, { groupId: work.id, name: 'Respire', description: 'Conte até 4' });

    const listed = await new ListCopingCardGroups(groups).execute(ANA);

    expect(listed).toEqual([
      { id: 2, name: 'Ansiedade', cardCount: 0 },
      { id: 1, name: 'Trabalho', cardCount: 1 },
    ]);
  });

  it('renames a group and reports a missing one', async () => {
    const group = await createGroup.execute({ userId: ANA, name: 'Trabalho' });
    const rename = new RenameCopingCardGroup(groups);

    await expect(
      rename.execute({ userId: ANA, groupId: group.id, name: 'Estudos' }),
    ).resolves.toEqual({ id: group.id, name: 'Estudos' });
    await expect(rename.execute({ userId: BIA, groupId: group.id, name: 'X' })).rejects.toThrow(
      NotFoundError,
    );
  });

  it('deletes only empty groups', async () => {
    const group = await createGroup.execute({ userId: ANA, name: 'Trabalho' });
    const deleteGroup = new DeleteCopingCardGroup(groups);
    const card = await cards.create(ANA, { groupId: group.id, name: 'A', description: 'B' });

    await expect(deleteGroup.execute({ userId: ANA, groupId: group.id })).rejects.toMatchObject({
      code: 'GROUP_NOT_EMPTY',
    });

    await cards.delete(ANA, card.id);
    await deleteGroup.execute({ userId: ANA, groupId: group.id });
    expect(groups.groups.size).toBe(0);
  });

  it("does not delete another user's group", async () => {
    const group = await createGroup.execute({ userId: ANA, name: 'Trabalho' });

    await expect(
      new DeleteCopingCardGroup(groups).execute({ userId: BIA, groupId: group.id }),
    ).rejects.toThrow(NotFoundError);
    expect(groups.groups.size).toBe(1);
  });
});
