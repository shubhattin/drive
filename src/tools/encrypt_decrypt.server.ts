import * as crypto from 'crypto';
import { hash_sha3_256 } from '@tools/hash.server';

const ALGORITHM = 'aes-256-cbc';
const OUTPUT_FORMAT = 'base64';
const IV_LENGTH = 16;
const IV_PREPEND_FORMAT = 'hex';

function generateKeyBuffer(key: string) {
  // returns a buffer of length 32 and hex of length 64 so sha3-256 suitable

  const key_buffer = Buffer.from(hash_sha3_256(key), 'hex');
  // OR by treating the 32 length as text
  // const key_buffer = Buffer.from(hash_sha3_256(key).substring(0, 32), 'utf-8');
  return key_buffer;
}

export function encrypt_text(text: string, key: string) {
  // iv :- initialization vector for random output
  const iv = crypto.randomBytes(IV_LENGTH);
  const iv_hex = iv.toString(IV_PREPEND_FORMAT);
  const key_buffer = generateKeyBuffer(key);
  const cipher = crypto.createCipheriv(ALGORITHM, key_buffer, iv);
  let encrypted = cipher.update(text, 'utf8', OUTPUT_FORMAT);
  encrypted += cipher.final(OUTPUT_FORMAT);
  return iv_hex + encrypted;
}

export function decrypt_text(encrypted: string, key: string) {
  const key_buffer = generateKeyBuffer(key);
  const iv = Buffer.from(encrypted.slice(0, IV_LENGTH * 2), IV_PREPEND_FORMAT);
  const encryptedText = encrypted.slice(IV_LENGTH * 2);
  const decipher = crypto.createDecipheriv(ALGORITHM, key_buffer, iv);
  let decrypted = decipher.update(encryptedText, OUTPUT_FORMAT, 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
