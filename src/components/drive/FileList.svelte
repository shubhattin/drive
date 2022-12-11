<script lang="ts">
  import ImageSpan from '@components/ImageSpan.svelte';
  import {
    lekhAH,
    files,
    currentLoc,
    selectedFiles,
    currentFiles,
    currentFolders,
    fileDataFetchDone
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

  const get_img_path = (key?: string) => {
    return key! in fileImageList ? fileImageList[key! as keyof typeof fileImageList] : fileImg;
  };
</script>

<div
  class="bg-[#fbfffb] inline-block mt-2 mx-1 mb-32 p-1.5 border-2 border-amber-800 min-w-[300px] min-h-[250px] rounded-md"
>
  {#each $currentFolders as key}
    <label
      class="text-[purple] font-semibold hover:text-black"
      on:click={() => folderOpen(key)}
      on:keydown
    >
      <input type="checkbox" class="mr-1 w-0 h-0 absolute invisible" disabled />
      <div class="flex mb-1 p-[2px] whitespace-pre-wrap active:text-orange-600 transition">
        <ImageSpan className="w-6 h-6 mr-1.5" src={folderImg} />
        {key}
      </div>
    </label>
  {/each}
  {#each $currentFiles as key}
    {@const src = get_img_path(key.split('.').pop())}
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
  {#if $fileDataFetchDone && $currentFiles.length + $currentFolders.length === 0}
    {lekh.no_file}
  {/if}
</div>
