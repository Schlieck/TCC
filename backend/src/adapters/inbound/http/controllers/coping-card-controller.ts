import type { Request, Response } from 'express';
import type { CreateCopingCard } from '../../../../application/use-cases/coping-cards/create-coping-card.js';
import type { DeleteCopingCard } from '../../../../application/use-cases/coping-cards/delete-coping-card.js';
import type { GetCopingCard } from '../../../../application/use-cases/coping-cards/get-coping-card.js';
import type { ListCopingCards } from '../../../../application/use-cases/coping-cards/list-coping-cards.js';
import type { UpdateCopingCard } from '../../../../application/use-cases/coping-cards/update-coping-card.js';
import { currentUserId } from '../middlewares/authenticate.js';
import { idParamsSchema } from '../schemas/common-schemas.js';
import { cardBodySchema, cardListQuerySchema } from '../schemas/coping-card-schemas.js';
import { parseRequest } from '../validation.js';

export interface CopingCardUseCases {
  listCards: ListCopingCards;
  getCard: GetCopingCard;
  createCard: CreateCopingCard;
  updateCard: UpdateCopingCard;
  deleteCard: DeleteCopingCard;
}

export class CopingCardController {
  constructor(private readonly useCases: CopingCardUseCases) {}

  list = async (request: Request, response: Response): Promise<void> => {
    const { groupId } = parseRequest(cardListQuerySchema, request.query);
    const cards = await this.useCases.listCards.execute({
      userId: currentUserId(response),
      ...(groupId === undefined ? {} : { groupId }),
    });
    response.json(cards);
  };

  show = async (request: Request, response: Response): Promise<void> => {
    const { id } = parseRequest(idParamsSchema, request.params);
    response.json(
      await this.useCases.getCard.execute({ userId: currentUserId(response), cardId: id }),
    );
  };

  create = async (request: Request, response: Response): Promise<void> => {
    const body = parseRequest(cardBodySchema, request.body);
    const card = await this.useCases.createCard.execute({
      userId: currentUserId(response),
      ...body,
    });
    response.status(201).json(card);
  };

  update = async (request: Request, response: Response): Promise<void> => {
    const { id } = parseRequest(idParamsSchema, request.params);
    const body = parseRequest(cardBodySchema, request.body);
    response.json(
      await this.useCases.updateCard.execute({
        userId: currentUserId(response),
        cardId: id,
        ...body,
      }),
    );
  };

  remove = async (request: Request, response: Response): Promise<void> => {
    const { id } = parseRequest(idParamsSchema, request.params);
    await this.useCases.deleteCard.execute({ userId: currentUserId(response), cardId: id });
    response.status(204).end();
  };
}
