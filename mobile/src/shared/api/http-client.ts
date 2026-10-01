import { z } from 'zod';
import { apiConfig } from '../config/api-config';
import { ApiError, NetworkError, UnexpectedResponseError } from './errors';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type QueryParams = Record<string, string | number | undefined>;

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  query?: QueryParams;
}

const REQUEST_TIMEOUT_MS = 15_000;

const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.array(z.object({ field: z.string(), message: z.string() })).optional(),
  }),
});

export function createHttpClient(baseUrl: string) {
  async function send(path: string, options: RequestOptions): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(buildUrl(baseUrl, path, options.query), {
        method: options.method ?? 'GET',
        headers: buildHeaders(options),
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: controller.signal,
      });
    } catch {
      throw new NetworkError();
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      throw await toApiError(response);
    }
    return response;
  }

  return {
    async request<T>(path: string, schema: z.ZodType<T>, options: RequestOptions = {}): Promise<T> {
      const response = await send(path, options);
      const parsed = schema.safeParse(await readJson(response));
      if (!parsed.success) {
        throw new UnexpectedResponseError();
      }
      return parsed.data;
    },

    async execute(path: string, options: RequestOptions = {}): Promise<void> {
      await send(path, options);
    },
  };
}

function buildUrl(baseUrl: string, path: string, query: QueryParams = {}): string {
  const params = Object.entries(query)
    .filter((entry): entry is [string, string | number] => entry[1] !== undefined)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  return `${baseUrl}${path}${params.length > 0 ? `?${params.join('&')}` : ''}`;
}

function buildHeaders(options: RequestOptions): Record<string, string> {
  return {
    Accept: 'application/json',
    ...(options.body === undefined ? {} : { 'Content-Type': 'application/json' }),
  };
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return (await response.json()) as unknown;
  } catch {
    throw new UnexpectedResponseError();
  }
}

async function toApiError(response: Response): Promise<ApiError> {
  const parsed = errorResponseSchema.safeParse(await readJson(response).catch(() => undefined));
  if (!parsed.success) {
    return new ApiError(response.status, 'UNEXPECTED_ERROR', 'Ocorreu um erro inesperado.');
  }
  const { code, message, details } = parsed.data.error;
  return new ApiError(response.status, code, message, details);
}

export const httpClient = createHttpClient(apiConfig.ok ? apiConfig.apiUrl : '');
