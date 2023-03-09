const str_to_array_buffer = (str: string) => {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
};
const array_buffer_to_str = (buff: ArrayBuffer) => {
  return Array.from(new Uint8Array(buff))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};
const do_hash = async (value: string, algorithm: string) => {
  const buffer = str_to_array_buffer(value); // Fix
  const hash_bytes = await crypto.subtle.digest(algorithm, buffer);
  const hash = array_buffer_to_str(hash_bytes);
  return hash;
};

export const hash_256 = async (str: string) => {
  return await do_hash(str, 'SHA-256');
};
export const salt = () => {
  // genertating a 32 length random string salt
  return array_buffer_to_str(crypto.getRandomValues(new Uint8Array(16)));
};

const str_to_bin_str = (value: string) => {
  const codeUnits = new Uint16Array(value.length);
  for (let i = 0; i < codeUnits.length; i++) {
    codeUnits[i] = value.charCodeAt(i);
  }
  return String.fromCharCode(...new Uint8Array(codeUnits.buffer));
};
const bin_str_to_str = (binary: string) => {
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return String.fromCharCode(...new Uint16Array(bytes.buffer));
};
/** `encode=true` by default */
export const to_base64 = (str: string, encode = true) => {
  if (encode) str = str_to_bin_str(str);
  return window.btoa(str);
};
/** `decode=false` by default */
export const from_base64 = (str: string, decode = false) => {
  str = window.atob(str);
  try {
    if (decode) str = bin_str_to_str(str);
  } catch {}
  return str;
};
