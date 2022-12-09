import { files } from '@state/drive';
import { graphql } from '@tools/drive/request';
import { set_val_from_adress } from '@tools/json';

export const reload_file_list = async () => {
  const list = (
    await graphql(
      `
        {
          fileList
        }
      `
    )
  ).fileList as string[];
  let json: any = {};
  for (let x of list) set_val_from_adress(`/${x}`, json, -1, true);
  files.set(json);
};

export let goBackInFileList: () => void = null!;
export const setGoBackInFileList = (func: typeof goBackInFileList) => {
  goBackInFileList = func;
};
