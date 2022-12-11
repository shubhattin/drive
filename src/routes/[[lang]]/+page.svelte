<script lang="ts">
  import type { PageData } from './$types';
  import { clsx } from '@tools/clsx';
  import { fetch_post } from '@tools/fetch';
  import { toast } from '@tools/toast';
  import { slide } from 'svelte/transition';
  import ToastContainer from '@tools/toast/ToastContainer.svelte';
  import type { infoType } from '@components/tracker/types';

  export let data: PageData;
  let lekh: typeof data.lekh;
  $: lekh = data.lekh;

  let loaded_data: infoType = null!;
  let err = false;
  let succes = false;
  let val: string = null!;

  // resetting the error info to false
  $: err && setTimeout(() => (err = false), 750);
  const onClick = async () => {
    if (val === '') return;
    const req = await fetch_post('/api/track_info', { json: { key: val } });
    val = '';
    if (req.status !== 200) {
      err = true; // will invoke reset
      toast.error(lekh.pass_error, 2000);
      return;
    }
    loaded_data = await req.json();
    succes = true;
  };
</script>

<svelte:head>
  <title>{lekh.title}</title>
</svelte:head>
{#if !succes}
  <form on:submit|preventDefault={onClick}>
    <input
      out:slide
      type="password"
      placeholder={lekh.pass_input}
      autocomplete="off"
      autocapitalize="off"
      class={clsx(
        'border-2 rounded-md outline-none text-2xl p-1 w-44 focus:ring transition-all duration-200',
        !err
          ? 'border-blue-800 ring-green-500 placeholder:text-zinc-400'
          : 'border-rose-600 ring-rose-200 placeholder:text-orange-400'
      )}
      bind:value={val}
    />
  </form>
{/if}
{#if succes}
  {#await import('@components/tracker/TrackInfo.svelte') then TrackInfo}
    <TrackInfo.default data={loaded_data} />
  {/await}
{/if}
<ToastContainer />
