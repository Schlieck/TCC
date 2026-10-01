import type { Request, Response } from 'express';
import type { CreateThoughtRecord } from '../../../../application/use-cases/thought-records/create-thought-record.js';
import type { DeleteThoughtRecord } from '../../../../application/use-cases/thought-records/delete-thought-record.js';
import type { GetThoughtRecord } from '../../../../application/use-cases/thought-records/get-thought-record.js';
import type { ListEmotions } from '../../../../application/use-cases/thought-records/list-emotions.js';
import type { ListThoughtRecords } from '../../../../application/use-cases/thought-records/list-thought-records.js';
import type { UpdateThoughtRecord } from '../../../../application/use-cases/thought-records/update-thought-record.js';
import { currentUserId } from '../middlewares/authenticate.js';
import { idParamsSchema } from '../schemas/common-schemas.js';
import { periodQuerySchema, thoughtRecordBodySchema } from '../schemas/thought-record-schemas.js';
import { parseRequest } from '../validation.js';

export interface ThoughtRecordUseCases {
  listEmotions: ListEmotions;
  listRecords: ListThoughtRecords;
  getRecord: GetThoughtRecord;
  createRecord: CreateThoughtRecord;
  updateRecord: UpdateThoughtRecord;
  deleteRecord: DeleteThoughtRecord;
}

export class ThoughtRecordController {
  constructor(private readonly useCases: ThoughtRecordUseCases) {}

  emotions = async (_request: Request, response: Response): Promise<void> => {
    response.json(await this.useCases.listEmotions.execute());
  };

  list = async (request: Request, response: Response): Promise<void> => {
    const period = parseRequest(periodQuerySchema, request.query);
    response.json(
      await this.useCases.listRecords.execute({ userId: currentUserId(response), ...period }),
    );
  };

  show = async (request: Request, response: Response): Promise<void> => {
    const { id } = parseRequest(idParamsSchema, request.params);
    response.json(
      await this.useCases.getRecord.execute({ userId: currentUserId(response), recordId: id }),
    );
  };

  create = async (request: Request, response: Response): Promise<void> => {
    const body = parseRequest(thoughtRecordBodySchema, request.body);
    const record = await this.useCases.createRecord.execute({
      userId: currentUserId(response),
      ...body,
    });
    response.status(201).json(record);
  };

  update = async (request: Request, response: Response): Promise<void> => {
    const { id } = parseRequest(idParamsSchema, request.params);
    const body = parseRequest(thoughtRecordBodySchema, request.body);
    response.json(
      await this.useCases.updateRecord.execute({
        userId: currentUserId(response),
        recordId: id,
        ...body,
      }),
    );
  };

  remove = async (request: Request, response: Response): Promise<void> => {
    const { id } = parseRequest(idParamsSchema, request.params);
    await this.useCases.deleteRecord.execute({ userId: currentUserId(response), recordId: id });
    response.status(204).end();
  };
}
