<script lang="ts">
  import Selector from './FileBar/Selector.svelte';
  import Reload from './FileBar/Reload.svelte';
  import Download from './FileBar/Download/Download.svelte';
  import FileView from './FileBar/Download/FileView.svelte';
  import Delete from './FileBar/Delete.svelte';
</script>

<div class="flex">
  <Selector />
  <Reload />
  <Download />
  <Delete />
  <FileView />
</div>
