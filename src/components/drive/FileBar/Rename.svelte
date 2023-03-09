<script lang="ts">
  import { lekhAH, selectedFiles, currentLoc, files } from '@state/drive';
  import BiRename from 'svelte-icons-pack/bi/BiRename';
  import Icon from '@tools/Icon.svelte';
  import { scale } from 'svelte/transition';
  import { set_val_from_adress } from '@tools/json';
  import type { fileInfoType } from '@state/drive_types';
  import { graphql } from '@tools/drive/request';
  import { to_base64 } from '@tools/kry/gupta';
  import { toast } from '@tools/toast';

  $: lekh = $lekhAH.fileBar.Rename;

  let clicked = false;
  let fl_name = '';
  let prev_name = '';

  let inputElmt: HTMLInputElement;

  // focuding input element when clicked
  let inputElmt_focused = false;
  $: !clicked && (inputElmt_focused = false);
  $: {
    if (clicked && !inputElmt_focused && inputElmt) {
      if (fl_name.indexOf('.') !== -1) {
        const index = fl_name.lastIndexOf('.');
        inputElmt.selectionStart = 0;
        inputElmt.selectionEnd = index;
        inputElmt_focused = true;
      }
      inputElmt.focus();
    }
  }

  const addFolder = async () => {
    if ($selectedFiles.length !== 1) return;
    if (fl_name === '') return;
    if (fl_name === prev_name) {
      clicked = false;
      return;
    }
    let prefix = $currentLoc;
    if (prefix === '/') prefix = '';
    const loc = `${prefix}/${$selectedFiles[0].name}`;
    const new_loc = `${prefix}/${fl_name}`;
    const new_loc_obj: fileInfoType = JSON.parse(JSON.stringify($selectedFiles[0]));
    new_loc_obj.name = fl_name;
    // deleting old named file refrence
    set_val_from_adress(loc, $files, -2);
    // adding renamed file refrence
    set_val_from_adress(new_loc, $files, new_loc_obj);
    clicked = false;
    await graphql(
      `
        mutation ($name: String!, $key: String!) {
          renameFile(name: $name, key: $key)
        }
      `,
      {
        key: $selectedFiles[0].key,
        name: to_base64(new_loc)
      }
    );
    toast.info(`${fl_name} ${lekh.renamed_msg}`, 2000, 'bottom-right');
    $files = $files;
  };
</script>

<span class="mr-2">
  <button
    on:click={() => {
      if ($selectedFiles.length !== 1) return;
      fl_name = $selectedFiles[0].name;
      prev_name = fl_name;
      clicked = true;
    }}
  >
    <Icon src={BiRename} className="text-2xl active:fill-blue-600" />
  </button>
  {#if clicked}
    <div
      in:scale
      out:scale
      class="fixed left-2 top-4 z-10 rounded-lg border-2 border-blue-700 bg-lime-100 p-1"
    >
      <form on:submit|preventDefault={addFolder}>
        <input
          bind:this={inputElmt}
          type="text"
          class="mb-2 block w-64 rounded border border-black px-1 text-sm"
          placeholder={lekh.file_name}
          bind:value={fl_name}
        />
      </form>
      <button
        on:click={addFolder}
        class="mr-2 rounded-lg border-2 border-green-600 px-1 py-[2px] text-sm active:border-black active:text-[green]"
      >
        {lekh.rename_msg}
      </button>
      <button
        on:click={() => (clicked = false)}
        class="mr-2 rounded-lg border-2 border-rose-500 px-1 py-[2px] text-sm active:border-black active:text-[red]"
      >
        {lekh.no}
      </button>
    </div>
  {/if}
</span>
