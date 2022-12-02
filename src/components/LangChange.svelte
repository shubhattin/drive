<script lang="ts">
  import { get_current_locale, change_locale, locales, locale_keys } from '@tools/get_link';
  import { clsx } from '@tools/clsx';
  import { page } from '$app/stores';

  let value: string;
  $: value = get_current_locale($page.params.lang);
</script>

<select
  bind:value
  class="w-4 h-4 fixed bottom-0 right-1 bg-zinc-100"
  on:change={() => change_locale(value)}
>
  {#each locale_keys as lng}
    <option
      value={lng}
      class={clsx('bg-black font-semibold', lng === value ? 'text-yellow-400' : 'text-white')}
    >
      {locales[lng]}
    </option>
  {/each}
</select>
