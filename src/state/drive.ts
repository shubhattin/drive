import { writable, get } from 'svelte/store';
import { val_from_adress } from '@tools/json';
import type { dattType } from '@langs/model';
import type { fileInfoType } from './drive_types';

export const lekhAH = writable<dattType['drive']['main']>(null!);

/** `name` will have full file paths in this */
export const files = writable<any>({});
export const currentLoc = writable('/');

/** `name` will only have file name in this */
export const selectedFiles = writable<fileInfoType[]>([]);
/** `name` will only have file name in this */
export const currentFiles = writable<fileInfoType[]>([]);
export const currentFolders = writable<string[]>([]);
export const fileDataFetchDone = writable(false);

const update_current_file_lits = () => {
  const currentDir = val_from_adress(get(currentLoc), get(files));
  const folderList: string[] = [];
  const fileList: fileInfoType[] = [];
  for (let item in currentDir) {
    let value = currentDir[item];
    if (
      !('name' in value) &&
      !('mime' in value) &&
      !('size' in value) &&
      !('date' in value) &&
      !('key' in value)
    ) {
      // if these keys are not present then it is a folder
      folderList.push(item);
    } else {
      let fl = value as fileInfoType;
      // as the 'name' filed is full path path we will append the name of the file
      fl.name = item;
      fileList.push(fl);
    }
  }
  currentFiles.set(fileList);
  currentFolders.set(folderList);
};

currentLoc.subscribe(update_current_file_lits);
files.subscribe(update_current_file_lits);
// changing the current files and folders with these changes

export const fileBarStores = {
  download: {
    totalSize: writable(0),
    downloadedSize: writable(0),
    fileName: writable(''),
    viewFileName: writable(''),
    iframeViewSrc: writable(''),
    downloading: writable(false)
  },
  kAryaCount: writable(0),
  currentReq: writable<XMLHttpRequest>(null!)
};
