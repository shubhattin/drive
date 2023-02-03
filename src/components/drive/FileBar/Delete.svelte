<script lang="ts">
  import RiDeleteButton from 'svelte-icons-pack/ri/RiSystemDeleteBin6Line';
  import Icon from '@tools/Icon.svelte';
  import { selectedFiles, lekhAH, currentLoc, files } from '@state/drive';
  import { slide, scale } from 'svelte/transition';
  import { set_val_from_adress } from '@tools/json';
  import { graphql } from '@tools/drive/request';
  import { toast } from '@tools/toast';

  let clicked = false;
  $: lekh = $lekhAH.fileBar.Delete;

  const delete_files = async () => {
    if ($selectedFiles.length === 0) return;
    const selected = $selectedFiles.map(
      (val) => ($currentLoc === '/' ? '' : $currentLoc) + '/' + val
    );
    clicked = false;
    const res = await graphql(
      `
        query ($files: [String!]!) {
          deleteFiles(files: $files) {
            deleted
            failed
          }
        }
      `,
      { files: selected }
    );
    for (let x of selected) set_val_from_adress(x, $files, -2);
    toast.info(`${$selectedFiles.join(', ')} ${lekh.deleted_msg}`, 3000, 'bottom-right');
    files.set($files);
  };
</script>

<span class="mr-2">
  <button on:click={() => $selectedFiles.length !== 0 && (clicked = true)}>
    <Icon src={RiDeleteButton} className="text-2xl active:fill-[red]" />
  </button>
  {#if clicked}
    <div
      in:scale
      out:slide
      class="fixed left-2 top-4 z-10 rounded-lg border-2 border-blue-700 bg-[aliceblue] p-1"
    >
      <div>{lekh.confirm_msg}</div>
      <button
        on:click={delete_files}
        class="mr-2 rounded-lg border-2 border-green-600 px-1 py-[2px] active:border-black active:text-[green]"
      >
        {lekh.yes}
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
