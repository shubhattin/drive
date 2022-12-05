<script lang="ts">
  import { clsx } from '@tools/clsx';
  import type { infoType } from './types';
  import Select from '@components/Select.svelte';
  import { writable } from 'svelte/store';
  import { fade, slide } from 'svelte/transition';

  export let data: infoType;

  const TOTAL_COUNT_KEY = 'परिगणना'; // name of total count key
  let val = writable('jala' in data ? 'jala' : Object.keys(data)[0]);
  $: list = (() => {
    let ls = Object.keys(data[$val].info);
    if (ls.indexOf(TOTAL_COUNT_KEY) !== -1) {
      delete ls[ls.indexOf(TOTAL_COUNT_KEY)];
      ls.unshift(TOTAL_COUNT_KEY);
    }
    return ls;
  })();
  let options: {
    [x in string]: { text: string; className: string | undefined };
  };
  $: options = (() => {
    let res: typeof options = {};
    for (let x in data)
      res[x] = { text: data[x].name, className: $val === x ? 'text-green-800' : undefined };
    return res;
  })();
</script>

<Select
  className={clsx(
    'text-2xl font-bold mb-4 text-rose-500 p-1.5 outline-none border-2 border-black rounded-md bg-white select-none',
    'focus:ring hover:ring ring-green-500 transition-all duration-200 hover:text-rose-600 focus:text-rose-600 active:text-amber-700'
  )}
  value={val}
  {options}
/>
<ul
  class={clsx(
    'mx-4 text-lg font-semibold text-fuchsia-800',
    `[&>li]:before:content-['•'] [&>li]:before:text-green-700 [&>li]:before:mr-1.5`
  )}
>
  {#each list as nm}
    {#if nm}
      {@const count = data[$val].info[nm]}
      <li
        in:slide
        out:fade
        class={clsx(
          'hover:before:text-black hover:text-fuchsia-600 group',
          nm === TOTAL_COUNT_KEY ? 'text-[blue]' : null
        )}
      >
        {nm} - <span class="text-amber-800 group-hover:text-blue-700">{count}</span>
      </li>
    {/if}
  {/each}
</ul>
