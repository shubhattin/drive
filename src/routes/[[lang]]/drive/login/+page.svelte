<script lang="ts">
  import type { PageData } from './$types';
  import { clsx } from '@tools/clsx';
  import { mode } from './state';
  import ToastContainer from '@tools/toast/ToastContainer.svelte';
  import { toast } from '@tools/toast';

  export let data: PageData;
  $: lekh = data.lekh.main;

  let id: string;
  let err = false;
  let pass: string;

  let idElmnt: HTMLInputElement;
  let passElmnt: HTMLInputElement;
</script>

<svelte:head>
  <title>{data.lekh.title}</title>
  <link rel="icon" href="/drive.ico" />
</svelte:head>
<div>
  <input
    bind:this={idElmnt}
    type="text"
    placeholder={lekh.id_input}
    autoComplete="off"
    spellCheck="false"
    class={clsx(
      'block mb-2 border-2 rounded-md outline-none text-2xl p-1 w-44 focus:ring-2 transition-all duration-200',
      !err
        ? 'border-blue-800 ring-green-500 placeholder:text-zinc-400'
        : 'border-rose-600 ring-rose-200 placeholder:text-orange-400'
    )}
    bind:value={id}
    on:keydown={({ keyCode, code }) => {
      if ((code === 'Enter' || keyCode === 13) && $mode === 'main' && passElmnt) passElmnt.focus();
    }}
  />
  {#if $mode !== 'reset'}
    <input
      bind:this={passElmnt}
      type="password"
      placeholder={lekh.pass_input}
      autoComplete="off"
      class={clsx(
        'block my-2 border-2 rounded-md outline-none text-2xl p-1 w-44 focus:ring-2 transition-all duration-200',
        !err
          ? 'border-blue-800 ring-green-500 placeholder:text-zinc-400'
          : 'border-rose-600 ring-rose-200 placeholder:text-orange-400'
      )}
      bind:value={pass}
      on:input={() => toast.error('Error', 3000)}
    />
  {/if}
</div>
<ToastContainer />
