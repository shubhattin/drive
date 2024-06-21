import { protectedProcedure, t } from '@api/trpc_init';
import { base_delete, base_fetch_all, base_get, base_put, drive_delete } from '@tools/deta';
import type { fileInfoType, fileInfoWithUserType } from '@state/drive_types';
import { fileInfoSchema } from '@state/drive_types';
import { z } from 'zod';
import { to_base64 } from '@tools/kry/gupta';
import { decrypt_text_buffer, encrypt_text_buffer } from '@tools/encrypt_decrypt.server';

const user_info_schema = z.object({
  key: z.string(),
  encrypt_key: z.string().base64()
});
const USER_INFO_LOC = 'users_info';
const USER_FILE_INFO_LOC = 'user_files';
const FILE_DRIVE_NAME = 'files';

async function get_user_encryption_key(user: string) {
  const { encrypt_key } = user_info_schema.parse(await base_get(USER_INFO_LOC, user));
  return Buffer.from(encrypt_key, 'base64');
}
const fileDBInfo = z.object({
  key: z.string(),
  user: z.string(),
  file_info: z.object({
    name: z.string(),
    size: z.number(),
    mime: z.string(),
    date: z.coerce.date()
  })
});
const fileDBEncryptedInfo = z.object({
  key: z.string(),
  user: z.string(),
  file_info: z.string()
});
type fileDBEncryptedInfoType = z.infer<typeof fileDBEncryptedInfo>;
type fileDBInfoType = z.infer<typeof fileDBInfo>;

const encrypt_file_info = (info: fileDBInfoType, key: Buffer) => {
  let encrypion_info: fileDBEncryptedInfoType = {
    ...info,
    file_info: encrypt_text_buffer(JSON.stringify(info.file_info), key)
  };
  return encrypion_info;
};
const decrypt_file_info = (info: fileDBEncryptedInfoType, key: Buffer) => {
  let decrypion_info: fileDBInfoType = {
    ...info,
    file_info: JSON.parse(decrypt_text_buffer(info.file_info, key))
  };
  return decrypion_info;
};

const fetch_file_list_route = protectedProcedure
  .output(fileInfoSchema.array())
  .query(async ({ ctx: { user } }) => {
    async function fetchFileList(user: string) {
      const encrypion_key = await get_user_encryption_key(user);
      const file_list = await base_fetch_all<fileDBEncryptedInfoType>(USER_FILE_INFO_LOC, {
        query: [{ user: user }]
      });
      const file_list_decoded = file_list.map((file) => {
        const data = decrypt_file_info(file, encrypion_key);
        return {
          key: data.key,
          user: data.user,
          name: data.file_info.name,
          size: data.file_info.size,
          mime: data.file_info.mime,
          date: data.file_info.date
        };
      });
      return file_list_decoded;
    }
    const data = await fetchFileList(user.user);
    return data;
  });

const delete_file_route = protectedProcedure
  .input(
    z.object({
      keys: z.string().array()
    })
  )
  .mutation(async ({ input: { keys }, ctx: { user } }) => {
    const keys_prefixed_with_user = keys.map((key) => `${user.user}/${key}`);
    await base_delete(USER_FILE_INFO_LOC, keys);
    return await drive_delete(FILE_DRIVE_NAME, keys_prefixed_with_user);
  });

const upload_id_route = protectedProcedure.query(async () => {
  const id = (await base_get<{ key: string; value: string }>('keys', 'drive_key'))!.value;
  return to_base64(id);
});

const download_id_route = protectedProcedure.query(async () => {
  const id = (await base_get<{ key: string; value: string }>('keys', 'drive_key'))!.value;
  return to_base64(id);
});

const upload_file_route = protectedProcedure
  .input(fileInfoSchema)
  .mutation(async ({ input: data, ctx: { user } }) => {
    let db_data: fileDBInfoType = {
      key: data.key,
      user: user.user,
      file_info: {
        name: data.name,
        size: data.size,
        mime: data.mime,
        date: data.date
      }
    };
    return await base_put<fileDBEncryptedInfoType>(USER_FILE_INFO_LOC, [
      encrypt_file_info(db_data, await get_user_encryption_key(user.user))
    ]);
  });

const rename_file_route = protectedProcedure
  .input(
    z.object({
      name: z.string(),
      key: z.string()
    })
  )
  .mutation(async ({ input: { name, key }, ctx: { user } }) => {
    const encryption_key = await get_user_encryption_key(user.user);
    const data = decrypt_file_info(
      (await base_get<fileDBEncryptedInfoType>(USER_FILE_INFO_LOC, key))!,
      encryption_key
    );
    data.file_info.name = name;
    await base_put(USER_FILE_INFO_LOC, [encrypt_file_info(data, encryption_key)]);
  });

const move_file_route = protectedProcedure
  .input(
    z.object({
      names: z.string().array(),
      keys: z.string().array()
    })
  )
  .mutation(async ({ input: { names, keys }, ctx: { user } }) => {
    const encryption_key = await get_user_encryption_key(user.user);
    const responses = keys.map(async (key, i) => {
      const data = decrypt_file_info(
        (await base_get<fileDBEncryptedInfoType>(USER_FILE_INFO_LOC, key))!,
        encryption_key
      );
      data.file_info.name = names[i];
      await base_put(USER_FILE_INFO_LOC, [encrypt_file_info(data, encryption_key)]);
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
