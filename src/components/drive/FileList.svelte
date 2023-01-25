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
  class="select-text bg-[#fbfffb] inline-block mt-2 mx-1 mb-32 p-1.5 border-2 border-amber-800 min-w-[300px] min-h-[250px] rounded-md"
>
  {#if !$fileDataFetchDone}
    <svg
      class="animate-spin ml-28 mt-24 h-10 w-10 text-blue-700"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  {:else if $currentFiles.length + $currentFolders.length === 0}
    {lekh.no_file}
  {:else}
    {#each $currentFolders as key (key)}
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
    {#each $currentFiles as key (key)}
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
  {/if}
</div>
