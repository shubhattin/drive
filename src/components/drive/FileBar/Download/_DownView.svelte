<script lang="ts">
  import { lekhAH, currentLoc, selectedFiles } from '@state/drive';
  import ProgressBar from '../ProgressBar.svelte';
  import BiShowAlt from 'svelte-icons-pack/bi/BiShowAlt';
  import FiDownload from 'svelte-icons-pack/fi/FiDownload';
  import Icon from '@tools/Icon.svelte';

  export let isView: boolean;

  let src = '';
  let downloading = false;
  let fileName = '';
  let fullSize: number;
  let downloaded: number;
</script>

<span class="mr-2">
  <button>
    {#if isView}
      <Icon src={BiShowAlt} className="text-3xl active:fill-[blue]" viewBox="0 0 24 24" />
    {:else}
      <Icon src={FiDownload} className="text-2xl active:text-[green]" />
    {/if}
  </button>
</span>
