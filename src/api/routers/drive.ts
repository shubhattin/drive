import { protectedProcedure, t } from '@api/trpc_init';
import { base_delete, base_fetch_all, base_get, base_put } from '@tools/deta';
import type { fileInfoType } from '@state/drive_types';
import { fileInfoSchema } from '@state/drive_types';
import { z } from 'zod';
import { from_base64, to_base64 } from '@tools/kry/gupta';

const fetch_file_list_route = protectedProcedure.query(async ({ ctx: { user } }) => {
  async function fetchFileList(user: string) {
    const file_list = await base_fetch_all<fileInfoType>(`${user}_files`);
    const file_list_decoded_names = file_list.map((file) => ({
      ...file,
      name: from_base64(file.name, true)
    }));
    return file_list_decoded_names;
  }
  return await fetchFileList(user.user);
});

const delete_file_route = protectedProcedure
  .input(
    z.object({
      keys: z.string().array()
    })
  )
  .mutation(async ({ input: { keys }, ctx: { user } }) => {
    return await base_delete(`${user.user}_files`, keys);
  });

const upload_id_route = protectedProcedure.query(async () => {
  const id = (await base_get<{ key: string; value: string }>('keys', 'drive_key'))!.value;
  return Buffer.from(id).toString('base64');
});

const download_id_route = protectedProcedure.query(async () => {
  const id = (await base_get<{ key: string; value: string }>('keys', 'drive_key'))!.value;
  return Buffer.from(id).toString('base64');
});

const upload_file_route = protectedProcedure
  .input(fileInfoSchema)
  .mutation(async ({ input: data, ctx: { user } }) => {
    data.name = to_base64(data.name);
    return await base_put(`${user.user}_files`, [data]);
  });

const rename_file_route = protectedProcedure
  .input(
    z.object({
      name: z.string(),
      key: z.string()
    })
  )
  .mutation(async ({ input: { name, key }, ctx: { user } }) => {
    const data = await base_get<fileInfoType>(`${user.user}_files`, key);
    data!.name = name;
    await base_put(`${user.user}_files`, [data!]);
  });

const move_file_route = protectedProcedure
  .input(
    z.object({
      names: z.string().array(),
      keys: z.string().array()
    })
  )
  .mutation(async ({ input: { names, keys }, ctx: { user } }) => {
    const responses = keys.map(async (key, i) => {
      const data = await base_get<fileInfoType>(`${user.user}_files`, key);
      data!.name = names[i];
      return base_put(`${user.user}_files`, [data!]);
    });
    await Promise.all(responses);
  });

export const drive_router = t.router({
  file_list: fetch_file_list_route,
  delete_file: delete_file_route,
  uploadID: upload_id_route,
  downloadID: download_id_route,
  upload_file: upload_file_route,
  rename_file: rename_file_route,
  move_file: move_file_route
});
