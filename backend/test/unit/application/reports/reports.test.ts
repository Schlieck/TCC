import { beforeEach, describe, expect, it } from 'vitest';
import { CreateSavedReport } from '../../../../src/application/use-cases/reports/create-saved-report.js';
import { DeleteSavedReport } from '../../../../src/application/use-cases/reports/delete-saved-report.js';
import { GetEmotionTrend } from '../../../../src/application/use-cases/reports/get-emotion-trend.js';
import { GetSavedReport } from '../../../../src/application/use-cases/reports/get-saved-report.js';
import { ListSavedReports } from '../../../../src/application/use-cases/reports/list-saved-reports.js';
import { parseCalendarDate } from '../../../../src/domain/shared/calendar-date.js';
import { NotFoundError } from '../../../../src/domain/shared/errors.js';
import { parseTimeOfDay } from '../../../../src/domain/shared/time-of-day.js';
import { InMemoryEmotionRepository } from '../../../support/in-memory/in-memory-emotion-repository.js';
import {
  InMemoryEmotionHistory,
  InMemorySavedReportRepository,
} from '../../../support/in-memory/in-memory-report-repositories.js';
import { InMemoryThoughtRecordRepository } from '../../../support/in-memory/in-memory-thought-record-repository.js';

const ANA = 1;
const BIA = 2;
const ANXIETY = 1;
const JOY = 7;

describe('GetEmotionTrend', () => {
  let records: InMemoryThoughtRecordRepository;
  let getTrend: GetEmotionTrend;

  async function record(userId: number, date: string, emotions: [number, number][]) {
    await records.create(userId, {
      title: 'Registro',
      date: parseCalendarDate(date),
      time: parseTimeOfDay('10:00'),
      description: 'Descrição',
      emotions: emotions.map(([emotionId, intensity]) => ({ emotionId, intensity })),
    });
  }

  beforeEach(() => {
    records = new InMemoryThoughtRecordRepository();
    getTrend = new GetEmotionTrend(
      new InMemoryEmotionHistory(records),
      new InMemoryEmotionRepository(),
    );
  });

  it('averages a week day by day, only with the user own records', async () => {
    await record(ANA, '2026-09-28', [
      [ANXIETY, 80],
      [JOY, 20],
    ]);
    await record(ANA, '2026-09-28', [[ANXIETY, 60]]);
    await record(ANA, '2026-10-02', [[JOY, 50]]);
    await record(BIA, '2026-09-28', [[ANXIETY, 0]]);

    const trend = await getTrend.execute({ userId: ANA, from: '2026-09-28', to: '2026-10-04' });

    expect(trend.granularity).toBe('day');
    expect(trend.buckets).toHaveLength(7);
    expect(trend.series).toEqual([
      {
        emotion: { id: ANXIETY, slug: 'anxiety', name: 'Ansiedade' },
        values: [70, null, null, null, null, null, null],
      },
      {
        emotion: { id: JOY, slug: 'joy', name: 'Alegria' },
        values: [20, null, null, null, 50, null, null],
      },
    ]);
  });

  it('groups a year by month', async () => {
    await record(ANA, '2026-01-10', [[ANXIETY, 90]]);
    await record(ANA, '2026-12-20', [[ANXIETY, 30]]);

    const trend = await getTrend.execute({ userId: ANA, from: '2026-01-01', to: '2026-12-31' });

    expect(trend.granularity).toBe('month');
    expect(trend.series[0]?.values).toEqual([
      90,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      30,
    ]);
  });

  it('validates the period', async () => {
    await expect(
      getTrend.execute({ userId: ANA, from: '2026-10-04', to: '2026-09-28' }),
    ).rejects.toMatchObject({ code: 'INVALID_PERIOD' });
  });
});

describe('saved reports', () => {
  let reports: InMemorySavedReportRepository;

  beforeEach(() => {
    reports = new InMemorySavedReportRepository();
  });

  it('saves only the name and the period', async () => {
    const saved = await new CreateSavedReport(reports).execute({
      userId: ANA,
      name: ' Setembro ',
      from: '2026-09-01',
      to: '2026-09-30',
    });

    expect(saved).toMatchObject({
      id: 1,
      name: 'Setembro',
      period: { from: '2026-09-01', to: '2026-09-30' },
    });
  });

  it('rejects a blank name', async () => {
    await expect(
      new CreateSavedReport(reports).execute({
        userId: ANA,
        name: '  ',
        from: '2026-09-01',
        to: '2026-09-30',
      }),
    ).rejects.toMatchObject({ code: 'INVALID_REPORT_NAME' });
  });

  it('lists, reopens and deletes only the user reports', async () => {
    const create = new CreateSavedReport(reports);
    const anaReport = await create.execute({
      userId: ANA,
      name: 'Agosto',
      from: '2026-08-01',
      to: '2026-08-31',
    });
    await create.execute({ userId: BIA, name: 'Outro', from: '2026-08-01', to: '2026-08-31' });

    expect(await new ListSavedReports(reports).execute(ANA)).toHaveLength(1);
    await expect(
      new GetSavedReport(reports).execute({ userId: BIA, reportId: anaReport.id }),
    ).rejects.toThrow(NotFoundError);
    await expect(
      new DeleteSavedReport(reports).execute({ userId: BIA, reportId: anaReport.id }),
    ).rejects.toThrow(NotFoundError);

    await new DeleteSavedReport(reports).execute({ userId: ANA, reportId: anaReport.id });
    expect(await new ListSavedReports(reports).execute(ANA)).toEqual([]);
  });
});
