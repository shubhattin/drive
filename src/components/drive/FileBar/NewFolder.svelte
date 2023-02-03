<script lang="ts">
  import { lekhAH, files, currentLoc } from '@state/drive';
  import BsFolderPlus from 'svelte-icons-pack/bs/BsFolderPlus';
  import Icon from '@tools/Icon.svelte';
  import { set_val_from_adress } from '@tools/json';
  import { scale } from 'svelte/transition';

  $: lekh = $lekhAH.fileBar.NewFolder;

  let clicked = false;
  let val = '';

  let inputElmt: HTMLInputElement;
  // focuding input element when clicked
  $: inputElmt && inputElmt.focus();

  const addFolder = () => {
    if (val === '') return;
    const loc = $currentLoc + ($currentLoc !== '/' ? '/' : '') + val;
    set_val_from_adress(loc, $files, {});
    val = '';
    clicked = false;
    $files = $files;
  };
</script>

<span class="mr-2">
  <button on:click={() => (clicked = true)}>
    <Icon src={BsFolderPlus} className="text-2xl active:fill-green-600" />
  </button>
  {#if clicked}
    <div
      in:scale
      out:scale
      class="fixed left-2 top-4 z-10 rounded-lg border-2 border-blue-700 bg-[aliceblue] p-1"
    >
      <form on:submit|preventDefault={addFolder}>
        <input
          bind:this={inputElmt}
          type="text"
          class="mb-2 rounded border border-black px-1"
          placeholder={lekh.file_input}
          bind:value={val}
        />
      </form>
      <button
        on:click={addFolder}
        class="mr-2 rounded-lg border-2 border-green-600 px-1 py-[2px] active:border-black active:text-[green]"
      >
        {lekh.add_file_msg}
      </button>
      <button
        on:click={() => (clicked = false)}
        class="mr-2 rounded-lg border-2 border-rose-500 px-1 py-[2px] active:border-black active:text-[red]"
      >
        {lekh.no}
      </button>
    </div>
  {/if}
</span>
