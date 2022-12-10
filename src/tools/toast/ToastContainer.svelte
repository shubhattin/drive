<script lang="ts">
  import { onMount } from 'svelte';
  import type { SvelteToast as SvelteToastType } from '@zerodevx/svelte-toast';

  let SvelteToast: typeof SvelteToastType = undefined!;
  let mounted = false;

  onMount(() => {
    setTimeout(async () => {
      SvelteToast = (await import('@zerodevx/svelte-toast')).SvelteToast;
      mounted = true;
    }, 500);
  });
</script>

{#if mounted}
  <div class="top-centre">
    <svelte:component this={SvelteToast} target="top-centre" />
  </div>
  <div class="top-left">
    <svelte:component this={SvelteToast} target="top-left" />
  </div>
  <div class="bottom-right">
    <svelte:component this={SvelteToast} target="bottom-right" />
  </div>
{/if}

<style scoped>
  .top-centre {
    --toastContainerTop: 1rem;
    --toastContainerRight: auto;
    --toastContainerBottom: auto;
    --toastContainerLeft: calc(50vw - 8rem);
  }
  .top-left {
    --toastContainerTop: 1rem;
    --toastContainerRight: auto;
    --toastContainerBottom: auto;
    --toastContainerLeft: 1.5rem;
  }
  .bottom-right {
    --toastContainerTop: auto;
    --toastContainerLeft: auto;
    --toastContainerBottom: 1rem;
    --toastContainerRight: 1.25rem;
  }
  :global(.error_qxt76c) {
    --toastBackground: hsl(0, 100%, 73%);
    --toastBarBackground: hsl(0, 100%, 62%);
    --toastColor: hsl(0, 100%, 95%);
  }
  :global(.success_qxt76c) {
    --toastColor: mintcream;
    --toastBackground: hsla(145, 96%, 29%, 0.9);
    --toastBarBackground: hsl(150, 98%, 18%);
  }
</style>
