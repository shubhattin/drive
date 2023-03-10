<script lang="ts">
  import BiReset from 'svelte-icons-pack/bi/BiReset';
  import AiTwoToneHome from 'svelte-icons-pack/ai/AiTwotoneHome';
  import Icon from '@tools/Icon.svelte';
  import { toast } from '@tools/toast';
  import { lekhAH, mode, id } from './state';
  import { fetch_post } from '@tools/fetch';

  $: lekh = $lekhAH.reset;
  let newPass: string = '';
  let email: string = '';

  const reset = async () => {
    if (email === '' || newPass === '' || $id === '') {
      toast.error(lekh.blank_msg, 3000);
      return;
    }
    const req = await fetch_post('/api/drive/reset', {
      json: { email: email, newPass: newPass, id: $id }
    });
    const res = await req.json();
    if (req.status != 200) {
      toast.error(res.detail, 2500);
      return;
    }
    toast.success(res.detail, 4000, 'top-left');
    newPass = '';
    email = '';
    $id = '';
    $mode = 'main';
  };
</script>

<div>
  <input
    type="password"
    class="mb-1 block w-40 rounded-lg border-2 border-emerald-600 p-1 text-sm"
    bind:value={newPass}
    placeholder={lekh.new_pass}
  />
  <input
    type="email"
    class="mb-1 block w-40 rounded-lg border-2 border-emerald-600 p-1 text-sm"
    bind:value={email}
    placeholder="Email"
  />
  <button
    on:click={reset}
    class="mb-1 block rounded-lg border-2 border-fuchsia-700 p-1 font-medium text-cyan-800 active:border-blue-600 active:text-red-500"
  >
    <Icon src={BiReset} className="text-2xl text-black" />
    {lekh.reset_btn}
  </button>
  <button on:click={() => ($mode = 'main')} class="block">
    <Icon src={AiTwoToneHome} className="mt-2 text-3xl ml-12 cursor-button" />
  </button>
</div>
