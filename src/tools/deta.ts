import { fetch_post, fetch_get, Fetch } from '@tools/fetch';
import { env } from '$env/dynamic/private';
import { z } from 'zod';

export type key_value_type<T> = {
  key: string;
  value: T;
};
const KEY = import.meta.env ? env.DETA_PROJECT_KEY : process.env.DETA_PROJECT_KEY!;

const URL = (baseName: string) => `https://database.deta.sh/v1/${KEY?.split('_')[0]}/${baseName}`;

const fetch_options_schema = z.object({
  query: z.any().array().optional(),
  limit: z.number().int().min(1).optional(),
  last: z.string().optional(),
  sort: z.enum(['asc', 'desc']).optional()
});
const fetch_all_options_schema = fetch_options_schema.omit({ last: true });

export const base_fetch = async <T>(
  baseName: string,
  options?: z.infer<typeof fetch_options_schema>
) => {
  const req = fetch_post(`${URL(baseName)}/query`, {
    json: options,
    headers: {
      'X-Api-Key': KEY!
    }
  });
  const resp = await req;
  const json: {
    paging: {
      size: number;
      last?: string;
    };
    items: T[];
  } = await resp.json();
  return json;
};

export const base_fetch_all = async <T>(
  baseName: string,
  options?: z.infer<typeof fetch_all_options_schema>
) => {
  let last: string | undefined;
  let list: T[] = [];
  while (true) {
    const dt = await base_fetch<T>(baseName, { last, ...options });
    list = list.concat(dt.items);
    last = dt.paging.last;
    if (!last) break;
  }
  return list;
};

export const base_get = async <T>(baseName: string, key: string) => {
  const req = fetch_get(`${URL(baseName)}/items/${key}`, {
    headers: {
      'X-Api-Key': KEY!
    }
  });
  const resp = await req;
  return (await resp.json()) as T | null;
};

export const base_put = async <T>(baseName: string, values: T[]) => {
  const req = Fetch(`${URL(baseName)}/items`, {
    method: 'PUT',
    json: {
      items: values
    },
    headers: {
      'X-Api-Key': KEY!
    }
  });
  const resp_json = (await (await req).json()) as {
    processed?: { items: T[] };
    failed?: { items: T[] };
  };
  return resp_json;
};

type BaseDeleteResponse<T extends string | string[]> = T extends string
  ? { key: string }
  : { key: string }[];

export const base_delete = async <T extends string | string[]>(
  baseName: string,
  keys: T
): Promise<BaseDeleteResponse<T>> => {
  const file_keys = Array.isArray(keys) ? keys : [keys];
  const responses_json = await Promise.all(
    file_keys.map(async (key) => {
      const resp = await Fetch(`${URL(baseName)}/items/${key}`, {
        method: 'DELETE',
        headers: {
          'X-Api-Key': KEY!
        }
      });
      return (await resp.json()) as { key: string };
    })
  );
  return responses_json as BaseDeleteResponse<T>;
};
