import { files, fileDataFetchDone, currentLoc } from '@state/drive';
import { ACCESS_ID, deleteAuthCookies, ensure_auth_access_status } from '@tools/auth_tools';
import { set_val_from_adress } from '@tools/json';
import { get } from 'svelte/store';
import { client, setJwtToken } from '@api/client';
import type { fileInfoType } from '@state/drive_types';
import { get_zod_key_enum } from '@langs/datt';
import { dattStruct } from '@langs/model';
import { router_push } from '@tools/i18n';

const drive_auth_error_enum = get_zod_key_enum(dattStruct.drive.login.drive_auth_msgs);

export const reload_file_list = async () => {
  fileDataFetchDone.set(false); // showing loading spinner
  setJwtToken(localStorage.getItem(ACCESS_ID)!);
  await ensure_auth_access_status();
  let list: fileInfoType[] = [];
  try {
    list = await client.drive.file_list.query();
  } catch (e: any) {
    const parse_msg = drive_auth_error_enum.safeParse(e.message);
    if (parse_msg.success) {
      const msg_code = parse_msg.data;
      if (msg_code === 'wrong_credentials') {
        deleteAuthCookies();
        router_push('/login');
      } else if (msg_code === 'expired_credentials') {
        /*
        This step actually is not needed here because we are actually checking it on the
        client side side itself before mmaking request. This way we also avoid checking it with each operation like rename, delete etc.
        So, practically eecution pointer should never reach here, if handled correctly on frontend.

        await renew_tokens_after_access_expire();
        */
      }
    }
    return;
  }
  setFilesStateFromFileList(list);
  fileDataFetchDone.set(true); // hiding loading spinner
};

function setFilesStateFromFileList(list: fileInfoType[]) {
  let json: any = {};
  const current_dir = get(currentLoc);
  let does_dir_exist = false;
  for (let item of list) {
    const name = item.name;
    does_dir_exist = does_dir_exist || name.startsWith(current_dir);
    set_val_from_adress(`${name}`, json, item, true);
  }
  // if current dir does not exist, set current dir to root
  if (!does_dir_exist) currentLoc.set('/');
  files.set(json);
}
export let goBackInFileList: () => void = null!;
export const setGoBackInFileList = (func: typeof goBackInFileList) => {
  goBackInFileList = func;
};
