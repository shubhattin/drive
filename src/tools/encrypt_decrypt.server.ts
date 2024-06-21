import * as crypto from 'crypto';
import { hash_sha3_256 } from '@tools/hash.server';

const ALGORITHM = 'aes-256-cbc';
const OUTPUT_FORMAT = 'base64';
const IV_LENGTH = 16;

function generateKeyBuffer(key: string) {
  // if key buffer is not provided we can generate by using hash from the string key

  // returns a buffer of length 32 and hex of length 64 so sha3-256 suitable

  const key_buffer = Buffer.from(hash_sha3_256(key), 'hex');
  // OR by treating the 32 length as text
  // const key_buffer = Buffer.from(hash_sha3_256(key).substring(0, 32), 'utf-8');
  return key_buffer;
}

/**
 * requires key `Buffer` for encrypion
 */
export function encrypt_text_buffer(text: string, key_buffer: Buffer) {
  // iv :- initialization vector for random output
  const iv = crypto.randomBytes(IV_LENGTH);
  const iv_base64 = iv.toString('base64');
  const cipher = crypto.createCipheriv(ALGORITHM, key_buffer, iv);
  let encrypted = cipher.update(text, 'utf8', OUTPUT_FORMAT);
  encrypted += cipher.final(OUTPUT_FORMAT);
  return `${iv_base64}-${encrypted}`;
}

export function encrypt_text(text: string, key: string) {
  const key_buffer = generateKeyBuffer(key);
  return encrypt_text_buffer(text, key_buffer);
}

/**
 * requires key `Buffer` for decryption
 */
export function decrypt_text_buffer(encrypted: string, key_buffer: Buffer) {
  const [iv_base64, encryptedText] = encrypted.split('-');
  const iv = Buffer.from(iv_base64, 'base64');
  const decipher = crypto.createDecipheriv(ALGORITHM, key_buffer, iv);
  let decrypted = decipher.update(encryptedText, OUTPUT_FORMAT, 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export function decrypt_text(encrypted: string, key: string) {
  const key_buffer = generateKeyBuffer(key);
  return decrypt_text_buffer(encrypted, key_buffer);
}
