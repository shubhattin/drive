<script lang="ts">
  import AiTwoToneHome from 'svelte-icons-pack/ai/AiTwotoneHome';
  import HiSolidUserAdd from 'svelte-icons-pack/hi/HiSolidUserAdd';
  import Icon from '@tools/Icon.svelte';
  import { toast } from '@tools/toast';
  import { lekhAH, mode, id, pass } from './state';
  import { fetch_post } from '@tools/fetch';

  $: lekh = $lekhAH.new_user;
  let email = '';

  const add_new_user = async () => {
    if ($pass === '' || $id === '' || email === '') {
      toast.error(lekh.blank_msg, 3000);
      return;
    }
    const req = await fetch_post('/api/drive/add_new_user', {
      json: { username: $id, password: $pass, email: email }
    });
    const res = await req.json();
    if (req.status !== 200) {
      toast.error(res.detail, 2500);
      return;
    }
    toast.success(res.detail, 4000, 'top-left');
    $id = '';
    $pass = '';
    email = '';
    $mode = 'main';
  };
</script>

<div>
  <input
    type="email"
    class="mb-1 block w-40 rounded-lg border-2 border-emerald-600 p-1 text-sm"
    bind:value={email}
    placeholder="Email"
  />
  <button
    on:click={add_new_user}
    class="rounded-lg border-2 border-orange-700 p-1 font-medium text-violet-700 active:border-blue-600 active:text-red-500"
  >
    <Icon src={HiSolidUserAdd} className="text-2xl text-black mr-1 ml-[2px]" />
    {lekh.add_btn}
  </button>
  <button on:click={() => ($mode = 'main')} class="block">
    <Icon src={AiTwoToneHome} className="mt-2 text-3xl ml-12 cursor-button" />
  </button>
</div>
