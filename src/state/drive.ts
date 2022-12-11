import { writable, get } from 'svelte/store';
import type { dattType } from '@langs/model';
import { val_from_adress } from '@tools/json';

export const lekhAH = writable<dattType['drive']['main']>(null!);

export const files = writable<any>({});
export const currentLoc = writable('/');

export const selectedFiles = writable<string[]>([]);
export const currentFiles = writable<string[]>([]);
export const currentFolders = writable<string[]>([]);
export const fileDataFetchDone = writable(false);

const update_current_file_lits = () => {
  const currentDir = val_from_adress(get(currentLoc), get(files));
  const list = Object.keys(currentDir);
  currentFolders.set(list.filter((key) => typeof currentDir[key] === 'object'));
  currentFiles.set(list.filter((key) => currentDir[key] === -1));
};

currentLoc.subscribe(update_current_file_lits);
files.subscribe(update_current_file_lits);
// changing the current files and folders with these changes

export const fileBarStores = {
  download: {
    totalSize: writable(0),
    downloadedSize: writable(0),
    fileName: writable(''),
    iframeViewSrc: writable(''),
    downloading: writable(false)
  },
  kAryaCount: writable(0),
  currentReq: writable<XMLHttpRequest>(null!)
};
