import { graphql } from '@tools/drive/request';
import { selectedFiles, currentLoc, fileBarStores } from '@state/drive';
import { get } from 'svelte/store';
import { AUTH_ID, getCookieVal } from '@tools/drive/request';
import { MIME } from '@components/drive/datt/mime';

const { fileName, viewFileName, totalSize, downloadedSize, downloading, iframeViewSrc } =
  fileBarStores.download;
const { currentReq, kAryaCount } = fileBarStores;

const get_URL = (id: string, user: string) => `https://drive.deta.sh/v1/${id}/${user}`;
export const download_file = async (isView: boolean) => {
  const list = get(selectedFiles).map(
    (val) => (get(currentLoc) === '/' ? '' : get(currentLoc)) + '/' + val
  );
  const ID = {
    download: window.atob(
      (
        await graphql(
          `
            {
              downloadID
            }
          `
        )
      )['downloadID'] as string
    ),
    project: ''
  };
  ID.project = ID.download.split('_')[0];
  const down_sanchit = async (i = 0) => {
    const nm = list[i];
    const nm1 = get(selectedFiles)[list.indexOf(nm)]; // name without prefix
    fileName.set(nm1);
    const TOKEN = JSON.parse(window.atob(getCookieVal(AUTH_ID)?.split('.')[1]!)).sub as string;
    const URL = get_URL(ID.project, TOKEN);
    const xhr = new XMLHttpRequest();
    currentReq.set(xhr);
    xhr.open('GET', `${URL}/files/download?name=${nm}`, true);
    xhr.setRequestHeader('X-Api-Key', ID.download);
    xhr.addEventListener(
      'progress',
      (evt) => {
        if (evt.lengthComputable) {
          let total = evt.total / (1024 * 1024),
            loaded = evt.loaded / (1024 * 1024);
          downloading.set(true);
          totalSize.set(parseFloat(total.toFixed(2)));
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
      const ext = nm1.split('.').pop();
      let typ = 'application/octet-stream';
      if (ext! in MIME) typ = MIME[ext! as keyof typeof MIME];
      let res = xhr.response as Blob;
      res = res.slice(0, res.size, typ);
      let url = window.URL.createObjectURL(res);
      if (!isView) {
        const tmp_el = document.createElement('div');
        tmp_el.innerHTML = '<a></a>';
        const elm = tmp_el.firstChild! as any;
        elm.href = url;
        elm.download = nm1;
        elm.click();
        elm.remove();
      } else {
        iframeViewSrc.set(url);
        viewFileName.set(get(fileName));
      }
      fileName.set('');
      downloadedSize.set(0);
      totalSize.set(0);
      if (list.length !== ++i) {
        down_sanchit(i);
      } else {
        downloading.set(false);
        kAryaCount.set(0);
      }
    };
  };
  down_sanchit();
};
