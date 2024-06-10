<script lang="ts">
  import { lekhAH, selectedFiles, fileBarStores } from '@state/drive';
  import ProgressBar from '../ProgressBar.svelte';
  import BiShowAlt from 'svelte-icons-pack/bi/BiShowAlt';
  import FiDownload from 'svelte-icons-pack/fi/FiDownload';
  import Icon from '@tools/Icon.svelte';
  import { toast } from '@tools/toast';
  import { scale, slide } from 'svelte/transition';
  import FiExternalLink from 'svelte-icons-pack/fi/FiExternalLink';
  import CgClose from 'svelte-icons-pack/cg/CgClose';
  import RiSystemDownloadLine from 'svelte-icons-pack/ri/RiSystemDownloadLine';

  export let isView: boolean;

  $: lekh = $lekhAH.fileBar.FileView;

  const { downloadedSize, totalSize, fileName, viewFileName, iframeViewSrc, downloading } =
    fileBarStores.download;
  const { kAryaCount, currentReq } = fileBarStores;

  const cancel_download = () => {
    $downloading = false;
    $kAryaCount = 0;
    $currentReq.abort();
    $currentReq = null!;
  };

  const preview = async () => {
    if ($kAryaCount !== 0) return;
    if ($selectedFiles.length === 0) return;
    if ($selectedFiles.length !== 1 && isView) {
      toast.error(lekh.view_error, 2500, 'top-left');
      return;
    }
    $kAryaCount++;
    const download_file = (await import('./download_file')).download_file;
    download_file(isView);
  };
</script>

<span class="mr-2">
  <button on:click={preview}>
    {#if isView}
      <Icon src={BiShowAlt} className="text-3xl active:fill-[blue]" viewBox="0 0 24 24" />
    {:else}
      <Icon src={FiDownload} className="text-2xl active:text-[green]" />
    {/if}
  </button>
  {#if isView && $iframeViewSrc !== ''}
    <div
      in:scale
      out:scale
      class="h-11/12 fixed left-2 top-2 z-10 w-11/12 rounded-lg border-2 border-blue-700 bg-[aliceblue] p-1"
    >
      <div class="ml-4 flex" style="justify-content: space-between;">
        <span class="text-2xl">
          <a href={$iframeViewSrc} target="_blank" class="ml-2" rel="noreferrer">
            <Icon src={FiExternalLink} className="text-[blue] hover:text-blue-700" />
          </a>
          <a href={$iframeViewSrc} class="ml-2" download={$viewFileName}>
            <Icon src={RiSystemDownloadLine} className="text-blue-800 hover:text-blue-700" />
          </a>
        </span>
        <button on:click={() => ($iframeViewSrc = '')}>
          <Icon src={CgClose} className="text-4xl text-red-500 cursor-button active:text-black" />
        </button>
      </div>
      <iframe src={$iframeViewSrc} class="m-1 mt-1 h-[80vh] w-[98%]" title="सञ्चितदर्शनपट्टिका" />
    </div>
  {/if}
  {#if $downloading}
    <div
      in:scale
      out:slide
      class="fixed bottom-2 left-2 z-10 min-h-[20px] min-w-[100px] max-w-[90%] rounded-lg border-2 border-[red] bg-[aliceblue] p-1 pl-1.5"
    >
      <div class="font-semibold">
        {lekh.download_msg} - <span class="text-[brown]">{$fileName}</span>
      </div>
      <div class="text-lg font-semibold">
        <span>
          <span class="text-purple-600">{$downloadedSize}</span>/
          <span class="text-violet-800">{$totalSize}</span>
        </span>
        <button on:click={cancel_download}>
          <Icon src={CgClose} className="text-[red] text-3xl ml-5 active:text-[brown]" />
        </button>
      </div>
      <ProgressBar per={($downloadedSize / $totalSize) * 100} />
    </div>
  {/if}
</span>
