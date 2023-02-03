<script lang="ts">
  import { get_current_locale, change_locale, locales, locale_keys } from '@tools/i18n';
  import { clsx } from '@tools/clsx';
  import { page } from '$app/stores';
  import { onDestroy } from 'svelte';

  let value = get_current_locale($page.params.lang);
  const unsubscribe = page.subscribe((page) => {
    const locale = get_current_locale(page.params.lang);
    if (locale !== value) value = locale;
  });
  onDestroy(unsubscribe);
</script>

<select
  bind:value
  class="fixed bottom-0 right-1 h-4 w-4 bg-zinc-100 outline-none"
  on:change={() => change_locale(value)}
>
  {#each locale_keys as lng (lng)}
    <option
      class={clsx('bg-black font-semibold', lng === value ? 'text-yellow-400' : 'text-white')}
      selected={lng === value}
      value={lng}>{locales[lng]}</option
    >
  {/each}
</select>
