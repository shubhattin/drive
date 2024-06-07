<script lang="ts">
  import type { PageData } from './$types';
  import { lekhAH } from '@state/drive';
  import FileBar from '@components/drive/FileBar.svelte';
  import FileList from '@components/drive/FileList.svelte';
  import FileNav from '@components/drive/FileNav.svelte';
  import { onMount } from 'svelte';
  import ToastContainer from '@tools/toast/ToastContainer.svelte';
  import { reload_file_list, goBackInFileList } from '@components/drive/karah';
  import { preloadData } from '$app/navigation';
  import { get_link } from '@tools/i18n';
  import { ensure_auth_access_status } from '@tools/auth_tools';

  export let data: PageData;
  $: $lekhAH = data.lekh;

  onMount(async () => {
    preloadData(get_link('/login')); // can be done for this page but not
    window.history.pushState(null, '', window.location.href);
    window.onpopstate = () => {
      window.history.pushState(null, '', window.location.href);
      goBackInFileList();
    };
    if (import.meta.env.PROD) {
      window.onbeforeunload = () => 'किं भवान्वास्तवमेव प्रतिगन्तुमिच्छसि';
    }
    await ensure_auth_access_status();
    await reload_file_list();
  });
</script>

<svelte:head>
  <title>{$lekhAH.title}</title>
  <link rel="icon" href="/drive.ico" />
</svelte:head>

<FileNav />
<FileBar />
<FileList />
<ToastContainer />
