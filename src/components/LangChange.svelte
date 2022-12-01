<script lang="ts">
  import { page } from '$app/stores';
  import { get_current_locale, change_locale, locales } from '@tools/get_link';

  let value = get_current_locale($page.params.lang);
</script>

<select
  bind:value
  class="w-4 h-4 fixed bottom-0 right-1 bg-zinc-100"
  on:change={() => change_locale(value)}
>
  {#each Object.keys(locales) as d}
    <option value={d}>{d}</option>
  {/each}
</select>
