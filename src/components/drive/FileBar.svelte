<script lang="ts">
  import Selector from './FileBar/Selector.svelte';
  import Reload from './FileBar/Reload.svelte';
  import Download from './FileBar/Download/Download.svelte';
  import FileView from './FileBar/Download/FileView.svelte';
  import Delete from './FileBar/Delete.svelte';
  import NewFolder from './FileBar/NewFolder.svelte';
  import Logout from './FileBar/Logout.svelte';
  import Upload from './FileBar/Upload.svelte';
</script>

<div class="flex">
  <Selector />
  <Reload />
  <Download />
  <Delete />
  <NewFolder />
  <Upload />
  <FileView />
  <Logout />
</div>
