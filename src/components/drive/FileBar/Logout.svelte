<script lang="ts">
  import { lekhAH } from '@state/drive';
  import { deleteAuthCookies } from '@tools/drive/request';
  import { router_push } from '@tools/i18n';
  import HiOutlineLogout from 'svelte-icons-pack/hi/HiOutlineLogout';
  import Icon from '@tools/Icon.svelte';
  import { scale } from 'svelte/transition';

  $: lekh = $lekhAH.fileBar.Logout;

  let clicked = false;

  const logout = () => {
    deleteAuthCookies();
    router_push('/drive/login');
  };
</script>

<span class="ml-6">
  <button on:click={() => (clicked = true)}>
    <Icon src={HiOutlineLogout} className="text-3xl cursor-button active:text-red-600" />
  </button>
  {#if clicked}
    <div
      in:scale
      class="fixed left-2 top-4 z-10 rounded-lg border-2 border-blue-700 bg-[aliceblue] p-1"
    >
      <div>{lekh.confirm_msg}</div>
      <button
        on:click={logout}
        class="mr-2 rounded-lg border-2 border-green-600 px-1 py-[2px] active:border-black active:text-[green]"
      >
        {lekh.yes}
      </button>
      <button
        on:click={() => (clicked = false)}
        class="mr-2 rounded-lg border-2 border-rose-500 px-1 py-[2px] active:border-black active:text-[red]"
      >
        {lekh.no}
      </button>
    </div>
  {/if}
</span>
