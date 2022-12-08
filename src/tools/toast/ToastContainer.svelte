{#await import('@zerodevx/svelte-toast') then Toast}
  <Toast.SvelteToast options={{ classes: ['toast_container'] }} />
{/await}

<style global lang="scss">
  .toast_container {
    &.error {
      --toastBackground: rgb(255, 115, 115);
      --toastBarBackground: rgb(255, 60, 60);
      --toastColor: rgb(255, 230, 230);
    }
  }
</style>
