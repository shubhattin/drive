<script lang="ts">
  import RiDeleteButton from 'svelte-icons-pack/ri/RiSystemDeleteBin6Line';
  import Icon from '@tools/Icon.svelte';
  import { selectedFiles, lekhAH } from '@state/drive';
  import { slide, scale } from 'svelte/transition';

  let clicked = false;
  $: lekh = $lekhAH.fileBar.Delete;

  const delete_files = () => {
    // const selected = getSelectedFiles().map((val) => (pre === '/' ? '' : pre) + '/' + val);
    // if (selected.length === 0) return;
    // setClicked(false);
    // const res = await graphql(
    //   `
    //     query ($files: [String!]!) {
    //       deleteFiles(files: $files) {
    //         deleted
    //         failed
    //       }
    //     }
    //   `,
    //   { files: selected }
    // );
    // refresh([selected, 'delete']);
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
      class="p-1 fixed z-10 left-2 top-4 border-2 border-blue-700 rounded-lg bg-[aliceblue]"
    >
      <div>{lekh.confirm_msg}</div>
      <button
        on:click={delete_files}
        class="rounded-lg border-green-600 border-2 px-1 mr-2 py-[2px] active:border-black active:text-[green]"
      >
        {lekh.yes}
      </button>
      <button
        on:click={() => (clicked = false)}
        class="rounded-lg border-rose-500 border-2 px-1 mr-2 py-[2px] active:border-black active:text-[red]"
      >
        {lekh.no}
      </button>
    </div>
  {/if}
</span>
