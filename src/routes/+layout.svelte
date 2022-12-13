<script lang="ts">
  import '../app.postcss';
  import { onMount } from 'svelte';
  import { change_html_lang_tag } from '@tools/i18n';

  onMount(change_html_lang_tag);
</script>

<div class="p-2">
  <slot />
  {#await import('@components/LangChange.svelte') then LangChange}
    <LangChange.default />
  {/await}
</div>
