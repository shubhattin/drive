<script lang="ts">
  import '../app.postcss';
  import LangChange from '@components/LangChange.svelte';
</script>

<div class="p-2">
  <slot />
  <LangChange />
</div>
