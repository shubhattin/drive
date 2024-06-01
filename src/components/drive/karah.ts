import { files, fileDataFetchDone, currentLoc } from '@state/drive';
import { ACCESS_ID, ensure_jwt_status } from '@tools/auth_tools';
import { set_val_from_adress } from '@tools/json';
import { from_base64 } from '@tools/kry/gupta';
import { get } from 'svelte/store';
import { client, setJwtToken } from '@api/client';

export const reload_file_list = async () => {
  fileDataFetchDone.set(false); // showing loading spinner
  setJwtToken(localStorage.getItem(ACCESS_ID)!);
  await ensure_jwt_status();
  const list = await client.drive.file_list.query();
  fileDataFetchDone.set(true); // hiding loading spinner
  let json: any = {};
  const current_dir = get(currentLoc);
  let does_dir_exist = false;
  for (let item of list) {
    // names are base64 encoded
    const name = from_base64(item.name, true);
    does_dir_exist = does_dir_exist || name.startsWith(current_dir);
    set_val_from_adress(`${name}`, json, item, true);
  }
  // if current dir does not exist, set current dir to root
  if (!does_dir_exist) currentLoc.set('/');
  files.set(json);
};

export let goBackInFileList: () => void = null!;
export const setGoBackInFileList = (func: typeof goBackInFileList) => {
  goBackInFileList = func;
};
