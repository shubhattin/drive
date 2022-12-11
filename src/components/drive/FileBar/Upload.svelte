<script lang="ts">
  import { lekhAH, fileBarStores, currentLoc, files } from '@state/drive';
  import Icon from '@tools/Icon.svelte';
  import FiUpload from 'svelte-icons-pack/fi/FiUpload';
  import RiDocumentFileUploadLine from 'svelte-icons-pack/ri/RiDocumentFileUploadLine';
  import CgClose from 'svelte-icons-pack/cg/CgClose';
  import { clsx } from '@tools/clsx';
  import { fly, scale, slide } from 'svelte/transition';
  import ProgressBar from './ProgressBar.svelte';
  import { graphql, getCookieVal, AUTH_ID } from '@tools/drive/request';
  import { fetch_post, Fetch } from '@tools/fetch';
  import { toast } from '@tools/toast';
  import { set_val_from_adress } from '@tools/json';

  $: lekh = $lekhAH.fileBar.Upload;

  let clicked = false;
  let filesToUpload: FileList;
  let uploading = false;
  let downloadedSize = 0;
  let totalSize = 0;
  let fileName = '';
  const { kAryaCount, currentReq } = fileBarStores;

  const get_URL = (id: string, user: string) => `https://drive.deta.sh/v1/${id}/${user}`;
  const upload_file = async () => {
    let prefix = $currentLoc;
    if (prefix === '/') prefix = '';
    const ids = (
      await graphql(
        `
          {
            uploadID
          }
        `
      )
    )['uploadID'] as string[];
    const upld = async (i = 0) => {
      const file = filesToUpload[i];
      const AkAra = file.size / (1024 * 1024);
      fileName = file.name;
      totalSize = parseFloat(AkAra.toFixed(2));
      uploading = true;
      const MAX_CHUNK_SIZE = 9.985 * 1024 * 1024;
      const TOKEN = JSON.parse(window.atob(getCookieVal(AUTH_ID)?.split('.')[1]!)).sub as string;
      const URL = get_URL(ids[0], TOKEN);
      const UPLOAD_ID = (
        await (
          await fetch_post(`${URL}/uploads`, {
            params: {
              name: `${prefix}/${file.name}`
            },
            headers: { 'X-Api-Key': window.atob(ids[1]) }
          })
        ).json()
      ).upload_id as string;
      let loaded = 0,
        count = 0;
      const reader = new FileReader();
      let blob = file.slice(loaded, MAX_CHUNK_SIZE);
      reader.readAsArrayBuffer(blob);
      reader.onload = () => {
        const xhr = new XMLHttpRequest();
        $currentReq = xhr;
        xhr.open(
          'POST',
          `${URL}/uploads/${UPLOAD_ID}/parts?part=${++count}&name=${prefix}/${file.name}`,
          true
        );
        xhr.setRequestHeader('X-Api-Key', window.atob(ids[1]));
        xhr.upload.addEventListener(
          'progress',
          function (evt) {
            if (evt.lengthComputable) {
              let loaded = (evt.loaded + MAX_CHUNK_SIZE * (count - 1)) / (1024 * 1024);
              downloadedSize = parseFloat(loaded.toFixed(2));
            }
          },
          false
        );
        xhr.send(reader.result);
        xhr.onload = async () => {
          loaded += MAX_CHUNK_SIZE;
          if (loaded < file.size) {
            blob = file.slice(loaded, loaded + MAX_CHUNK_SIZE);
            reader.readAsArrayBuffer(blob);
          } else {
            const req = await Fetch(`${URL}/uploads/${UPLOAD_ID}`, {
              params: {
                name: `${prefix}/${file.name}`
              },
              method: 'PATCH',
              headers: { 'X-Api-Key': window.atob(ids[1]) }
            });
            if (req.status === 200) {
              set_val_from_adress(`${prefix}/${file.name}`, $files, -1);
              toast.success(`${file.name} ${lekh.added_msg}`, 3800, 'bottom-right');
              files.set($files);
              fileName = '';
              downloadedSize = 0;
              totalSize = 0;
              if (filesToUpload.length !== ++i) {
                upld(i);
              } else {
                $kAryaCount = 0;
                uploading = false;
              }
            }
          }
        };
      };
    };
    upld();
  };
  const startUpload = () => {
    if ($kAryaCount !== 0) return;
    if (filesToUpload && filesToUpload.length === 0) return;
    clicked = false;
    $kAryaCount++;
    upload_file();
  };
  const closeUpload = () => {
    uploading = false;
    $kAryaCount = 0;
    $currentReq.abort();
    $currentReq = null!;
  };
</script>

<span class="mr-2">
  <button on:click={() => (clicked = true)}>
    <Icon src={FiUpload} className="text-2xl active:text-[green]" />
  </button>
  {#if clicked}
    <div
      in:fly
      out:scale
      class="p-1 fixed z-10 left-2 top-4 border-2 border-blue-700 rounded-lg bg-[aliceblue]"
    >
      <div>
        <input
          type="file"
          multiple
          bind:files={filesToUpload}
          class={clsx(
            'file:mr-1 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-md file:font-semibold  file:text-white',
            'file:bg-gradient-to-r file:from-blue-600 file:to-amber-600',
            'hover:file:cursor-pointer hover:file:opacity-80 text-xs text-grey-500'
          )}
        />
        <button on:click={startUpload}>
          <Icon src={RiDocumentFileUploadLine} className="text-3xl" />
        </button>
      </div>
      <button
        on:click={() => (clicked = false)}
        class="rounded-lg border-green-600 border-2 px-1 mr-2 mt-1.5 py-[2px] active:border-black active:text-[green]"
      >
        {lekh.yes}
      </button>
    </div>
  {/if}
  {#if uploading}
    <div
      in:scale
      out:slide
      class="p-1 pl-1.5 fixed z-10 left-2 bottom-2 border-2 border-[red] rounded-lg bg-[aliceblue] min-w-[100px] min-h-[20px] max-w-[90%]"
    >
      <div class="font-semibold">
        {lekh.upload_msg} - <span class="text-[brown]">{fileName}</span>
      </div>
      <div class="font-semibold text-lg">
        <span>
          <span class="text-purple-600">{downloadedSize}</span>/
          <span class="text-violet-800">{totalSize}</span>
        </span>
        <button on:click={closeUpload}>
          <Icon src={CgClose} className="text-[red] text-3xl ml-5 active:text-[brown]" />
        </button>
      </div>
      <ProgressBar per={(downloadedSize / totalSize) * 100} />
    </div>
  {/if}
</span>
