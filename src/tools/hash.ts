/*
The crytography hashing functions implemented here can be used both in node as well as browser
*/

import { array_buffer_to_str, str_to_array_buffer } from '@tools/kry/gupta';

const do_hash = async (value: string, algorithm: string) => {
  const buffer = str_to_array_buffer(value); // Fix
  const hash_bytes = await crypto.subtle.digest(algorithm, buffer);
  const hash = array_buffer_to_str(hash_bytes);
  return hash;
};

export const hash_512 = async (str: string) => {
  // length :- 128
  return await do_hash(str, 'SHA-512');
};

export const hash_256 = async (str: string) => {
  // length :- 64
  return await do_hash(str, 'SHA-256');
};

export const gen_salt = () => {
  // length :- 32
  return array_buffer_to_str(crypto.getRandomValues(new Uint8Array(16)));
};

/** Hash verifier for `sha-256` */
export const puShTi = async (pass: string, hash: string) => {
  const salt = hash.substring(64);
  const hsh = hash.substring(0, 64);
  return hsh === (await hash_256(pass + salt));
};
