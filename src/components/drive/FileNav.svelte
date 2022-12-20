<script lang="ts">
  import { currentLoc } from '@state/drive';
  import Icon from '@tools/Icon.svelte';
  import BiArrowBack from 'svelte-icons-pack/bi/BiArrowBack';
  import { setGoBackInFileList } from './karah';

  $: list = $currentLoc.substring(1).split('/');
  const go_back = () => {
    if ($currentLoc === '/') return;
    list.pop();
    $currentLoc = '/' + list.join('/');
  };
  setGoBackInFileList(go_back);
</script>

<div class="mt-2 mb-1 5">
  <button on:click={go_back}>
    <Icon src={BiArrowBack} className="ml-[2px] text-2xl mr-3 cursor-button active:text-blue-800" />
  </button>
  <span class="font-semibold text-violet-900">
    <button
      on:click={() => currentLoc.set('/')}
      class="hover:text-black active:text-[red] px-[2px]"
    >
      /
    </button>
    {#if list[0] !== ''}
      {#each list as key, i (key)}
        <span>
          <button
            on:click={() => currentLoc.set('/' + list.slice(0, i + 1).join('/'))}
            class="mx-[2px] hover:text-purple-600 active:text-[red]"
          >
            {key}
          </button>
          {i === list.length - 1 ? '' : '/'}
        </span>
      {/each}
    {/if}
  </span>
</div>
