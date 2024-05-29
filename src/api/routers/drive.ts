import { protectedProcedure, t } from '@api/trpc_init';
import { base_fetch_all } from '@tools/deta';
import type { fileInfoType } from '@state/drive_types';

const fetch_file_list_route = protectedProcedure.query(async ({ ctx: { user } }) => {
  const file_list = await base_fetch_all<fileInfoType>(`${user.user}_files`);
  return file_list;
});
export const drive_router = t.router({
  file_list: fetch_file_list_route
});
