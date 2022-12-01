export const json_to_address = (v: any) => {
  if (!v) return [];
  let r: any[] = [];

  function prcs(x: any, n: any, pr: any) {
    let tp = typeof n[x];
    let v1 = `${pr}/${x}`;
    if (Array.isArray(n[x])) lst(n[x], v1); // @ts-check
    else if (tp == 'object') jsn(n[x], v1);
    else r.push(`${pr}/${x}`);
  }

  function jsn(n: any, pr = '') {
    for (let x in n) prcs(x, n, pr);
  }

  function lst(n: any[], pr = '') {
    for (let x = 0; x < n.length; x++) prcs(x, n, pr);
  }
  if (typeof v == 'object') v = jsn(v);
  else if (Array.isArray(v)) v = lst(v);
  return r;
};
export const val_from_adress = (lc: any, vl: any) => {
  let n = vl;
  if (lc == '/') return n;
  lc = lc.substring(1).split('/');
  for (let x of lc) {
    let t = x;
    if (Array.isArray(n)) t = parseInt(t);
    n = n[t];
  }
  return n;
};
export const set_val_from_adress = (lc: any, vl: any, val: any = null, make = false) => {
  let n = vl;
  lc = lc.substring(1).split('/');
  let ln = lc.length;
  for (let i = 0; i < ln; i++) {
    let x = lc[i];
    let t = x;
    if (Array.isArray(n)) t = parseInt(t);
    if (i == ln - 1) {
      if (val === -2) delete n[t];
      else n[t] = val;
    } else {
      if (!(t in n) && make) n[t] = {};
      n = n[t];
    }
  }
  return vl;
};
export const copyJSON = (json: Object): Object => JSON.parse(JSON.stringify(json));
