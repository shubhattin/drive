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
  class="mx-1 mb-32 mt-2 inline-block min-h-[250px] min-w-[300px] select-text rounded-md border-2 border-amber-800 bg-[#fbfffb] p-1.5"
>
  {#if !$fileDataFetchDone}
    <svg
      class="ml-28 mt-24 h-10 w-10 animate-spin text-blue-700"
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
      <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
      <label
        class="font-semibold text-[purple] hover:text-black"
        on:click={() => folderOpen(key)}
        on:keydown
      >
        <input type="checkbox" class="invisible absolute mr-1 h-0 w-0" disabled />
        <div class="mb-1 flex whitespace-pre-wrap p-[2px] transition active:text-orange-600">
          <ImageSpan className="w-6 h-6 mr-1.5" src={folderImg} />
          {key}
        </div>
      </label>
    {/each}
    {#each $currentFiles as fileItem (fileItem.key)}
      {@const src = get_img_path(fileItem.name.split('.').pop())}
      <label class="font-semibold text-[#00f] hover:text-black">
        <input
          type="checkbox"
          class="peer invisible absolute mr-1 h-0 w-0"
          bind:group={$selectedFiles}
          value={fileItem}
        />
        <div
          class="mb-1 flex whitespace-pre-wrap rounded-sm p-[2px] transition hover:bg-zinc-100 active:text-rose-600 peer-checked:bg-[#f2ff82]"
        >
          <ImageSpan className="w-5 h-5 mr-1.5 mt-1" {src} />
          {fileItem.name}
        </div>
      </label>
    {/each}
  {/if}
</div>
