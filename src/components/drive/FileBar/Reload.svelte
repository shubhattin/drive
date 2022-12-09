<script lang="ts">
  import Icon from '@tools/Icon.svelte';
  import AiOutlineReload from 'svelte-icons-pack/ai/AiOutlineReload';
  import { reload_file_list } from '../karah';
</script>

<span class="mr-2">
  <button on:click={reload_file_list}>
    <Icon
      src={AiOutlineReload}
      className="text-2xl cursor-button active:bg-gray-100 rounded-xl active:fill-[blue]"
    />
  </button>
</span>
