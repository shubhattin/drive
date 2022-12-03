<script lang="ts">
  import { onMount } from 'svelte';
  import type { Writable } from 'svelte/store';

  export let value: Writable<string>;
  export let onChange: () => any = undefined!;
  export let className: string = undefined!;
  export let options: {
    [x in string]: { text: string; className: string | undefined | null };
  };

  let width = 0;
  let mounted = false;
  onMount(() => {
    width = resize(elm);
    mounted = true;
  });

  const change = (target: HTMLSelectElement) => {
    width = resize(target);
    if (onChange) onChange();
  };
  let elm: HTMLSelectElement;

  const replace_all = (str: string, replaceWhat: string, replaceTo: string) => {
    replaceWhat = replaceWhat.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    var re = new RegExp(replaceWhat, 'g');
    return str.replace(re, replaceTo);
  };
  const resize = (target: HTMLSelectElement, extra = 0) => {
    target.style.removeProperty('width');
    let i = target.innerHTML;
    let o = target.outerHTML;
    o = replace_all(o, i, '');
    const tmp_el = document.createElement('div');
    tmp_el.innerHTML = o;
    const elm = tmp_el.firstChild! as HTMLSelectElement;
    elm.innerHTML = `<option>${target.querySelector('option:checked')?.innerHTML}</option>`;
    document.body.appendChild(elm);
    const wdth = elm.offsetWidth + extra;
    elm.remove();
    return wdth;
  };
</script>

<select
  bind:this={elm}
  bind:value={$value}
  on:change={(e) => change(e.currentTarget)}
  class={className}
  style:width={mounted ? `${width}px` : null}
>
  {#each Object.keys(options) as vl}
    {#if mounted || vl === $value}
      <option value={vl} class={options[vl].className} selected={vl === $value}
        >{options[vl].text}</option
      >
    {/if}
  {/each}
</select>
