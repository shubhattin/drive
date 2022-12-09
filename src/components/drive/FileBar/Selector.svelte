<script lang="ts">
  import { selectedFiles, currentLoc, currentFiles } from '@state/drive';
  let checked = false;

  // unchecking whenver the location in FileNav has changed
  $: $currentLoc && (checked = false);
  // selecting files based on selection
  $: $selectedFiles = !checked ? [] : $currentFiles;
</script>

<span class="mr-2 cursor-default">
  <input type="checkbox" bind:checked />
</span>
