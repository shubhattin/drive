<script lang="ts">
  import ImageSpan from '@components/ImageSpan.svelte';
  import {
    files,
    currentLoc,
    selectedFiles,
    lekhAH,
    currentFiles,
    currentFolders
  } from '@state/drive';
  import fileImageList, { fileImg, folderImg } from './datt/fileType';
  import { onDestroy } from 'svelte';

  $: lekh = $lekhAH.fileList;

  const folderOpen = (path: string) => {
    $currentLoc += ($currentLoc !== '/' ? '/' : '') + path;
  };

  onDestroy(() => {
    $currentLoc = '/';
    $files = {};
  });
</script>

<div
  class="bg-[#fbfffb] inline-block mt-2 mx-1 mb-32 p-1.5 border-2 border-amber-800 min-w-[300px] min-h-[250px] rounded-md"
>
  {#each $currentFolders as key}
    <label
      class="text-[purple] font-semibold hover:text-black"
      on:click={() => folderOpen(key)}
      on:keydown={() => {}}
    >
      <input type="checkbox" class="mr-1 w-0 h-0 absolute invisible" disabled />
      <div class="flex mb-1 p-[2px] whitespace-pre-wrap active:text-orange-600 transition">
        <!-- <FcOpenedFolder className="text-2xl mr-1.5" /> -->
        <ImageSpan className="w-5 h-5 mr-1.5 mt-1" src={folderImg} />
        {key}
      </div>
    </label>
  {/each}
  {#each $currentFiles as key}
    {@const ext = key.split('.').pop()}
    {@const src = ext in fileImageList ? fileImageList[ext] : fileImg}
    <label class="text-[#00f] font-semibold hover:text-black">
      <input
        type="checkbox"
        class="mr-1 w-0 h-0 absolute peer invisible"
        bind:group={$selectedFiles}
        value={key}
      />
      <div
        class="flex mb-1 p-[2px] rounded-sm whitespace-pre-wrap active:text-rose-600 peer-checked:bg-[#f2ff82] hover:bg-zinc-100 transition"
      >
        <ImageSpan className="w-5 h-5 mr-1.5 mt-1" {src} />
        {key}
      </div>
    </label>
  {/each}
  <!-- {#if list.length === 0}
    {lekh.no_file}
  {/if} -->
</div>
