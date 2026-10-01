import type { CopingCardGroupId } from '../../../domain/coping-card/coping-card-group.js';
import { ValidationError } from '../../../domain/shared/errors.js';
import type { UserId } from '../../../domain/user/user.js';
import type { CopingCardGroupRepository } from '../../ports/coping-card-group-repository.js';

/** Um cartão só pode usar um grupo do mesmo usuário. */
export async function assertOwnGroup(
  groups: CopingCardGroupRepository,
  userId: UserId,
  groupId: CopingCardGroupId,
): Promise<void> {
  if (!(await groups.findById(userId, groupId))) {
    throw new ValidationError('INVALID_CARD_GROUP', 'Group does not exist', 'groupId');
  }
}
