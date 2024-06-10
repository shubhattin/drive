import { decrypt_text, encrypt_text } from '@tools/encrypt_decrypt.server';
import { describe, expect, it } from 'vitest';

describe('Encrypt & Decrypt Text', () => {
  it('encrypt_decrypt text', () => {
    const VALUES = ['using aes-256-cbc', 'यूनिकोड'];
    const KEYS = ['f67jkdkey', 'गूढपदଅr'];
    // keys and values both should be able to take unicoe values as well

    for (const KEY of KEYS)
      for (let value of VALUES) {
        const encrypted = encrypt_text(value, KEY);
        const decrypted = decrypt_text(encrypted, KEY);
        expect(decrypted).toBe(value);
      }
  });
});
