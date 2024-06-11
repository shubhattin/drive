import { selectedFiles, fileBarStores } from '@state/drive';
import { get } from 'svelte/store';
import { ensure_auth_access_status, get_access_token_info } from '@tools/auth_tools';
import { from_base64, to_base64 } from '@tools/kry/gupta';
import { client } from '@api/client';

const { fileName, viewFileName, totalSize, downloadedSize, downloading, iframeViewSrc } =
  fileBarStores.download;
const { currentReq, kAryaCount } = fileBarStores;

export const USER_FILES_DRIVE_NAME = 'files';
export const get_user_folder_in_drive = (user: string) => to_base64(user);

const get_URL = (id: string) => `https://drive.deta.sh/v1/${id}/${USER_FILES_DRIVE_NAME}`;
export const download_file = async (isView: boolean) => {
  await ensure_auth_access_status();
  const ID = {
    download: from_base64(await client.drive.downloadID.query()),
    project: ''
  };
  ID.project = ID.download.split('_')[0];
  const down_sanchit = async (i = 0) => {
    const fl_info = get(selectedFiles)[i];
    fileName.set(fl_info.name);
    totalSize.set(parseFloat((fl_info.size / (1024 * 1024)).toFixed(2)));
    const USER = get_access_token_info().user;
    const URL = get_URL(ID.project);
    const xhr = new XMLHttpRequest();
    currentReq.set(xhr);
    const FILE_NAME = encodeURI(`${get_user_folder_in_drive(USER)}/${fl_info.key}`);
    xhr.open('GET', `${URL}/files/download?name=${FILE_NAME}`, true);
    xhr.setRequestHeader('X-Api-Key', ID.download);
    xhr.addEventListener(
      'progress',
      (evt) => {
        if (evt.lengthComputable) {
          let total = evt.total / (1024 * 1024),
            loaded = evt.loaded / (1024 * 1024);
          downloading.set(true);
          downloadedSize.set(parseFloat(loaded.toFixed(2)));
        }
      },
      false
    );
    xhr.send();
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 2)
        if (xhr.status == 200) xhr.responseType = 'blob';
        else xhr.responseType = 'text';
    };
    xhr.onload = () => {
      const typ = fl_info.mime;
      let res = xhr.response as Blob;
      res = res.slice(0, res.size, typ);
      let url = window.URL.createObjectURL(res);
      if (!isView) {
        const tmp_el = document.createElement('div');
        tmp_el.innerHTML = '<a></a>';
        const elm = tmp_el.firstChild! as any;
        elm.href = url;
        elm.download = fl_info.name;
        elm.click();
        elm.remove();
      } else {
        iframeViewSrc.set(url);
        viewFileName.set(get(fileName));
      }
      fileName.set('');
      downloadedSize.set(0);
      totalSize.set(0);
      if (get(selectedFiles).length !== ++i) {
        down_sanchit(i);
      } else {
        downloading.set(false);
        kAryaCount.set(0);
        selectedFiles.set([]);
      }
    };
  };
  down_sanchit();
};
