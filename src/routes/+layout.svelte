<script lang="ts">
  import '../app.postcss';
  import LangChange from '@components/LangChange.svelte';
  import { onMount } from 'svelte';
  import { change_html_lang_tag } from '@tools/i18n';

  onMount(change_html_lang_tag);
</script>

<div class="p-2">
  <slot />
  <LangChange />
</div>
