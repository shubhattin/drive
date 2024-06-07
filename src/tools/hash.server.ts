import * as crypto from 'crypto';

export const hash_md5 = (str: string) => {
  // length :- 32
  return crypto.createHash('md5').update(str).digest('hex');
};

export const hash_sha3_256 = (str: string) => {
  // length :- 64
  return crypto.createHash('sha3-256').update(str).digest('hex');
};

export const hash_sha3_512 = (str: string) => {
  // length :- 128
  return crypto.createHash('sha3-512').update(str).digest('hex');
};

export const hash_sha_512 = (str: string) => {
  // length :- 128
  return crypto.createHash('sha-512').update(str).digest('hex');
};

export const hash_sha_256 = (str: string) => {
  // length :- 64
  return crypto.createHash('sha-256').update(str).digest('hex');
};

export const gen_salt = () => {
  // length :- 32
  return crypto.randomBytes(16).toString('hex');
};
