import { files, fileDataFetchDone, currentLoc } from '@state/drive';
import { graphql } from '@tools/drive/request';
import { set_val_from_adress } from '@tools/json';
import type { fileInfoType } from '@state/drive_types';
import { bin_str_to_str } from '@tools/kry/gupta';
import { get } from 'svelte/store';

export const reload_file_list = async () => {
  fileDataFetchDone.set(false); // showing loading spinner
  const list = (
    await graphql(
      `
        query {
          fileList {
            name
            size
            mime
            key
            date
          }
        }
      `
    )
  ).fileList as fileInfoType[];
  fileDataFetchDone.set(true); // hiding loading spinner
  let json: any = {};
  const current_dir = get(currentLoc);
  let does_dir_exist = false;
  for (let item of list) {
    // names are base64 encoded
    const name = bin_str_to_str(window.atob(item.name));
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
