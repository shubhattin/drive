import { files, fileDataFetchDone } from '@state/drive';
import { graphql } from '@tools/drive/request';
import { set_val_from_adress } from '@tools/json';
import type { fileInfoType } from '@state/drive_types';

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
  for (let item of list) {
    // names are base64 encoded
    const name = window.atob(item.name);
    set_val_from_adress(`${name}`, json, item, true);
  }
  files.set(json);
};

export let goBackInFileList: () => void = null!;
export const setGoBackInFileList = (func: typeof goBackInFileList) => {
  goBackInFileList = func;
};
