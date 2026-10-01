import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { todayIso } from '@/shared/dates';
import {
  periodAround,
  periodLabel,
  shiftAnchor,
  type PeriodKind,
  type ReportPeriod,
} from '../report-period';

/** Pedido vindo da rota /reports: atalho "humor do mês" ou relatório salvo. */
interface PeriodRequest {
  kind?: PeriodKind;
  from?: string;
  to?: string;
  /** Muda a cada navegação, para reaplicar o pedido mesmo que os valores se repitam. */
  at?: string;
}

interface Selection {
  kind: PeriodKind;
  anchor: Date;
  custom: ReportPeriod;
}

const KINDS: readonly PeriodKind[] = ['week', 'month', 'year', 'custom'];

export function useReportPeriod() {
  const request = readRequest(useLocalSearchParams());
  const requestKey = [request.at, request.kind, request.from, request.to].join('|');
  const [selection, setSelection] = useState(() => applyRequest(request, defaultSelection()));
  const [appliedKey, setAppliedKey] = useState(requestKey);

  // Ajuste de estado quando a rota traz um novo pedido (padrão do React, sem useEffect).
  if (appliedKey !== requestKey) {
    setAppliedKey(requestKey);
    setSelection(applyRequest(request, selection));
  }

  const { kind, anchor, custom } = selection;
  const period = kind === 'custom' ? ordered(custom) : periodAround(kind, anchor);
  const canGoNext =
    kind !== 'custom' && periodAround(kind, shiftAnchor(kind, anchor, 1)).from <= todayIso();

  return {
    kind,
    period,
    custom,
    canGoNext,
    label: periodLabel(kind, period),
    changeKind: (next: PeriodKind) => {
      setSelection((current) => ({
        ...current,
        kind: next,
        custom: next === 'custom' ? period : current.custom,
      }));
    },
    shift: (steps: number) => {
      if (kind !== 'custom') {
        setSelection((current) => ({
          ...current,
          anchor: shiftAnchor(kind, current.anchor, steps),
        }));
      }
    },
    setCustom: (next: ReportPeriod) => {
      setSelection((current) => ({ ...current, custom: next }));
    },
  };
}

function defaultSelection(): Selection {
  const today = new Date();
  return { kind: 'month', anchor: today, custom: periodAround('month', today) };
}

function applyRequest(request: PeriodRequest, current: Selection): Selection {
  if (request.from && request.to) {
    return { ...current, kind: 'custom', custom: { from: request.from, to: request.to } };
  }
  if (request.kind && request.kind !== 'custom') {
    return { ...current, kind: request.kind, anchor: new Date() };
  }
  return current;
}

function readRequest(params: Record<string, unknown>): PeriodRequest {
  const kind = KINDS.find((candidate) => candidate === params.kind);
  return {
    ...(kind ? { kind } : {}),
    ...(typeof params.from === 'string' ? { from: params.from } : {}),
    ...(typeof params.to === 'string' ? { to: params.to } : {}),
    ...(typeof params.at === 'string' ? { at: params.at } : {}),
  };
}

function ordered(period: ReportPeriod): ReportPeriod {
  return period.from <= period.to ? period : { from: period.to, to: period.from };
}
