<script lang="ts">
  import type { PageData } from './$types';
  import { clsx } from '@tools/clsx';
  import ToastContainer from '@tools/toast/ToastContainer.svelte';
  import AiOutlineLogin from 'svelte-icons-pack/ai/AiOutlineLogin';
  import BiReset from 'svelte-icons-pack/bi/BiReset';
  import Icon from '@tools/Icon.svelte';
  import { toast } from '@tools/toast';
  import { fetch_post } from '@tools/fetch';
  import { storeAuthCookies } from '@tools/drive/cookie_info';
  import type { authRes } from '@tools/drive/cookie_info';
  import { router_push } from '@tools/i18n';
  import { isLocalStorage, setIsLocalStorage } from '@state/ref/drive/shared';
  import { getLocalStorageState } from '@tools/state';
  import Reset from './Reset.svelte';
  import NewUser from './NewUser.svelte';
  import { mode, id, pass, lekhAH } from './state';
  import { onMount } from 'svelte';
  import { getCookieVal, AUTH_ID } from '@tools/drive/request';
  import Blocker from '@tools/block';

  export let data: PageData;
  $: $lekhAH = data.lekh;
  $: lekh = $lekhAH.main;

  onMount(() => {
    window.onpopstate = null;
    window.onbeforeunload = null;
    if (getCookieVal(AUTH_ID)) {
      router_push('/drive');
      // this redirect should usually be handled on the server or edge function
    }
    import.meta.env.PROD && Blocker();
  });
  let err = false;
  const remember = getLocalStorageState<boolean>('drive_remember_pass_atom', isLocalStorage);
  $: setIsLocalStorage($remember);
  let show_remember_btn = false;

  $: ($id || $pass) && (show_remember_btn = true);

  let idElmnt: HTMLInputElement;
  let passElmnt: HTMLInputElement;
  $: err && setTimeout(() => (err = false), 750);
  const validate = async () => {
    const req = await fetch_post('/drive/login', {
      form: { username: $id, password: $pass }
    });
    $id = '';
    $pass = '';
    const rs = await req.json();
    if (req.status !== 200) {
      err = true;
      idElmnt.focus();
      if (req.status === 401) toast.error(rs.detail, 3000);
      return;
    }
    storeAuthCookies(rs as authRes);
    router_push('/drive');
  };
</script>

<svelte:head>
  <title>{data.lekh.title}</title>
  <link rel="icon" href="/drive.ico" />
</svelte:head>
<form on:submit|preventDefault>
  <input
    bind:this={idElmnt}
    type="text"
    placeholder={lekh.id_input}
    autoComplete="off"
    spellCheck="false"
    class={clsx(
      'block mb-2 border-2 rounded-md outline-none text-2xl p-1 w-44 focus:ring-2 transition-all duration-200',
      !err
        ? 'border-blue-800 ring-green-500 placeholder:text-zinc-400'
        : 'border-rose-600 ring-rose-200 placeholder:text-orange-400'
    )}
    bind:value={$id}
    on:keydown={({ keyCode, code }) => {
      if ((code === 'Enter' || keyCode === 13) && $mode === 'main') passElmnt.focus();
    }}
  />
  {#if $mode !== 'reset'}
    <input
      bind:this={passElmnt}
      type="password"
      placeholder={lekh.pass_input}
      autoComplete="off"
      class={clsx(
        'block my-2 border-2 rounded-md outline-none text-2xl p-1 w-44 focus:ring-2 transition-all duration-200',
        !err
          ? 'border-blue-800 ring-green-500 placeholder:text-zinc-400'
          : 'border-rose-600 ring-rose-200 placeholder:text-orange-400'
      )}
      bind:value={$pass}
      on:keydown={({ keyCode, code }) => {
        if ((code === 'Enter' || keyCode === 13) && $mode === 'main') validate();
      }}
    />
  {/if}
</form>
{#if $mode === 'main'}
  {#if show_remember_btn}
    <label
      class={clsx(
        'block text-cyan-800 font-medium p-1 rounded-lg',
        'active:border-blue-600 active:text-black font-medium',
        `transition ${$remember ? 'text-[green]' : 'text-[red]'}`
      )}
    >
      <input type="checkbox" bind:checked={$remember} class="mr-1" />
      <span>{lekh.remember_btn}</span>
    </label>
  {/if}
  <button on:click={validate}>
    <Icon src={AiOutlineLogin} className="text-black text-4xl ml-3 active:fill-blue-700" />
  </button>
  <button
    on:click={() => mode.set('reset')}
    class="border-2 border-fuchsia-700 text-cyan-800 font-medium p-1 rounded-lg mx-2 active:border-blue-600 active:text-red-500"
  >
    <Icon src={BiReset} className="text-2xl text-black" />
    {lekh.reset_btn}
  </button>
{/if}
{#if $mode === 'reset'}
  <Reset />
{/if}
{#if $mode === 'new_user'}
  <NewUser />
{/if}
<ToastContainer />
