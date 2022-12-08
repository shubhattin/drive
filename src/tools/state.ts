import { writable } from 'svelte/store';

export const getLocalStorageState = <Type>(key: string, defualt_value: any) => {
  const value = writable<Type>(defualt_value);
  try {
    if (localStorage && key in localStorage) {
      let vl = JSON.parse(localStorage.getItem(key)!);
      value.set(vl);
    }
  } catch {}
  let init = false;
  value.subscribe((v) => {
    try {
      if (init) {
        localStorage.setItem(key, JSON.stringify(v));
      } else {
        init = true;
      }
    } catch {}
  });
  return value;
};
