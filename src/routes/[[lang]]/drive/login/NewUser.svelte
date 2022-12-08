<script lang="ts">
  import AiTwoToneHome from 'svelte-icons-pack/ai/AiTwotoneHome';
  import HiSolidUserAdd from 'svelte-icons-pack/hi/HiSolidUserAdd';
  import Icon from '@tools/Icon.svelte';
  import { toast } from '@tools/toast';
  import { lekhAH, mode, id, pass } from './state';
  import { fetch_post } from '@tools/fetch';

  $: lekh = $lekhAH.new_user;
  let mainPass = '';

  const add_new_user = async () => {
    if ($pass === '' || $id === '' || mainPass === '') {
      toast.error(lekh.blank_msg, 3000);
      return;
    }
    const req = await fetch_post('/drive/add_new_user', {
      json: { username: $id, password: $pass, mukhya: mainPass }
    });
    const res = await req.json();
    if (req.status !== 200) {
      toast.error(res.detail, 2500);
      return;
    }
    toast.success(res.detail, 4000, 'top-left');
    $id = '';
    $pass = '';
    mainPass = '';
  };
</script>

<div>
  <input
    type="password"
    class="block mb-1 border-2 border-emerald-600 rounded-lg p-1 w-40 text-sm"
    bind:value={mainPass}
    placeholder={lekh.main_pass}
  />
  <button
    on:click={add_new_user}
    class="border-2 border-orange-700 text-violet-700 font-medium p-1 rounded-lg  active:border-blue-600 active:text-red-500"
  >
    <Icon src={HiSolidUserAdd} className="text-2xl text-black mr-1 ml-[2px]" />
    {lekh.add_btn}
  </button>
  <button on:click={() => ($mode = 'main')} class="block">
    <Icon src={AiTwoToneHome} className="mt-2 text-3xl ml-12 cursor-button" />
  </button>
</div>
