<script lang="ts">
  import BiReset from 'svelte-icons-pack/bi/BiReset';
  import AiOutlineUserAdd from 'svelte-icons-pack/ai/AiOutlineUserAdd';
  import AiTwoToneHome from 'svelte-icons-pack/ai/AiTwotoneHome';
  import Icon from '@tools/Icon.svelte';
  import { toast } from '@tools/toast';
  import { lekhAH, mode, id } from './state';
  import { fetch_post } from '@tools/fetch';

  $: lekh = $lekhAH.reset;
  let newPass: string = '';
  let currentPass: string = '';

  const reset = async () => {
    if (currentPass === '' || newPass === '' || $id === '') {
      toast.error(lekh.blank_msg, 3000);
      return;
    }
    const req = await fetch_post('/drive/reset', {
      json: { currentPass: currentPass, newPass: newPass, id: $id }
    });
    const res = await req.json();
    if (req.status != 200) {
      toast.error(res.detail, 2500);
      return;
    }
    toast.success(res.detail, 4000, 'top-left');
    newPass = '';
    currentPass = '';
    $id = '';
  };
</script>

<div>
  <input
    type="password"
    class="block mb-1 border-2 border-emerald-600 rounded-lg p-1 w-40 text-sm"
    bind:value={currentPass}
    placeholder={lekh.current_pass}
  />
  <input
    type="password"
    class="block mb-1 border-2 border-emerald-600 rounded-lg p-1 w-40 text-sm"
    bind:value={newPass}
    placeholder={lekh.new_pass}
  />
  <button
    on:click={reset}
    class="block border-2 border-fuchsia-700 text-cyan-800 font-medium p-1 rounded-lg mb-1 active:border-blue-600 active:text-red-500"
  >
    <Icon src={BiReset} className="text-2xl text-black" />
    {lekh.reset_btn}
  </button>
  <button
    on:click={() => mode.set('new_user')}
    class="border-2 border-lime-600 text-emerald-600 font-medium p-1 rounded-lg active:border-blue-600 active:text-red-500"
  >
    <Icon src={AiOutlineUserAdd} className="text-xl text-black" />
    {lekh.new_user_btn}
  </button>
  <button on:click={() => ($mode = 'main')} class="block">
    <Icon src={AiTwoToneHome} className="mt-2 text-3xl ml-12 cursor-button" />
  </button>
</div>
