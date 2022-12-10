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
      class="p-1 fixed z-10 left-2 top-4 border-2 border-blue-700 rounded-lg bg-[aliceblue]"
    >
      <div>{lekh.confirm_msg}</div>
      <button
        on:click={logout}
        class="rounded-lg border-green-600 border-2 px-1 mr-2 py-[2px] active:border-black active:text-[green]"
      >
        {lekh.yes}
      </button>
      <button
        on:click={() => (clicked = false)}
        class="rounded-lg border-rose-500 border-2 px-1 mr-2 py-[2px] active:border-black active:text-[red]"
      >
        {lekh.no}
      </button>
    </div>
  {/if}
</span>
