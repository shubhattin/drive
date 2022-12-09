import { writable, get } from 'svelte/store';
import type { dattType } from '@langs/model';
import { val_from_adress } from '@tools/json';

export const lekhAH = writable<dattType['drive']['main']>(null!);

export const files = writable<any>({});
export const currentLoc = writable('/');
// export const refreshFilesAtom = atom<[string[], 'add' | 'delete']>([null!, null!]);

export const selectedFiles = writable<string[]>([]);
export const currentFiles = writable<string[]>([]);
export const currentFolders = writable<string[]>([]);

const update_current_file_lits = () => {
  const currentDir = val_from_adress(get(currentLoc), get(files));
  const list = Object.keys(currentDir);
  currentFolders.set(list.filter((key) => typeof currentDir[key] === 'object'));
  currentFiles.set(list.filter((key) => currentDir[key] === -1));
};

currentLoc.subscribe(update_current_file_lits);
files.subscribe(update_current_file_lits);
// changing the current files and folders with these changes
