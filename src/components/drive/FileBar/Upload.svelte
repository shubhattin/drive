<script lang="ts">
  import { lekhAH, fileBarStores, currentLoc, files, currentFiles } from '@state/drive';
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
  import { hash_256, salt, str_to_bin_str } from '@tools/kry/gupta';
  import { MIME as MIME_TYPE_LIST } from '../datt/mime';
  import type { fileInfoType } from '@state/drive_types';

  $: lekh = $lekhAH.fileBar.Upload;

  let clicked = false;
  let filesToUpload: FileList;
  let uploading = false;
  let downloadedSize = 0;
  let totalSize = 0;
  let fileName = '';
  const { kAryaCount, currentReq } = fileBarStores;

  const get_URL = (id: string, user: string) => `https://drive.deta.sh/v1/${id}/${user}`;
  const check_for_file_in_current_directory = (name: string) => {
    for (let item of $currentFiles) {
      if (item.name === name) return true;
    }
    return false;
  };
  const upload_file = async () => {
    let prefix = $currentLoc;
    if (prefix === '/') prefix = '';
    const ID = {
      upload: window.atob(
        (
          await graphql(
            `
              {
                uploadID
              }
            `
          )
        ).uploadID as string
      ),
      project: ''
    };
    ID.project = ID.upload.split('_')[0];
    const upld = async (i = 0) => {
      const file = filesToUpload[i];
      if (check_for_file_in_current_directory(file.name)) {
        toast.error(`${file.name} ${lekh.already_exists}`, 2500, 'top-centre');
        continue_next_file(i);
        return;
      }
      let MIME_TYPE = file.type;
      if (!MIME_TYPE || MIME_TYPE === '') {
        const ext = file.name.split('.').pop();
        if (ext) {
          const mime = MIME_TYPE_LIST[ext! as keyof typeof MIME_TYPE_LIST];
          if (mime) MIME_TYPE = mime;
        }
      }
      const fileInfo: fileInfoType = {
        name: file.name,
        size: file.size.toString(),
        mime: MIME_TYPE,
        date: new Date().toUTCString(),
        key: ''
      };
      const FILE_HASH_NAME = await hash_256(fileInfo.date + salt());
      fileInfo.key = FILE_HASH_NAME;
      const AkAra = file.size / (1024 * 1024);
      fileName = file.name;
      totalSize = parseFloat(AkAra.toFixed(2));
      uploading = true;
      const MAX_CHUNK_SIZE = 9.985 * 1024 * 1024;
      const USER_TOKEN = JSON.parse(window.atob(getCookieVal(AUTH_ID)?.split('.')[1]!))
        .sub as string;
      const URL = get_URL(ID.project, USER_TOKEN);
      const UPLOAD_ID = (
        await (
          await fetch_post(`${URL}/uploads`, {
            params: {
              name: FILE_HASH_NAME
            },
            headers: { 'X-Api-Key': ID.upload }
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
          `${URL}/uploads/${UPLOAD_ID}/parts?part=${++count}&name=${FILE_HASH_NAME}`,
          true
        );
        xhr.setRequestHeader('X-Api-Key', ID.upload);
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
                name: FILE_HASH_NAME
              },
              method: 'PATCH',
              headers: { 'X-Api-Key': ID.upload }
            });
            if (req.status === 200) {
              // save file info in database
              await graphql(
                `
                  mutation (
                    $name: String!
                    $size: String!
                    $date: String!
                    $mime: String!
                    $key: String!
                  ) {
                    uploadFile(name: $name, date: $date, mime: $mime, size: $size, key: $key)
                  }
                `,
                {
                  name: window.btoa(str_to_bin_str(`${prefix}/${file.name}`)),
                  size: fileInfo.size,
                  date: fileInfo.date,
                  mime: fileInfo.mime,
                  key: fileInfo.key
                }
              );
              set_val_from_adress(`${prefix}/${file.name}`, $files, fileInfo);
              toast.success(`${file.name} ${lekh.added_msg}`, 3800, 'bottom-right');
              files.set($files);
              continue_next_file(i);
            }
          }
        };
      };
    };
    const continue_next_file = (i: number) => {
      fileName = '';
      downloadedSize = 0;
      totalSize = 0;
      if (filesToUpload.length !== ++i) {
        upld(i);
      } else {
        filesToUpload = null!;
        $kAryaCount = 0;
        uploading = false;
      }
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
      class="fixed left-2 top-4 z-10 rounded-lg border-2 border-blue-700 bg-[aliceblue] p-1"
    >
      <div>
        <input
          type="file"
          multiple
          bind:files={filesToUpload}
          class={clsx(
            'file:text-md file:mr-1 file:rounded-full file:border-0 file:py-1 file:px-2 file:font-semibold  file:text-white',
            'file:bg-gradient-to-r file:from-blue-600 file:to-amber-600',
            'text-grey-500 text-xs hover:file:cursor-pointer hover:file:opacity-80'
          )}
        />
        <button on:click={startUpload}>
          <Icon src={RiDocumentFileUploadLine} className="text-3xl" />
        </button>
      </div>
      <button
        on:click={() => (clicked = false)}
        class="mr-2 mt-1.5 rounded-lg border-2 border-green-600 px-1 py-[2px] active:border-black active:text-[green]"
      >
        {lekh.yes}
      </button>
    </div>
  {/if}
  {#if uploading}
    <div
      in:scale
      out:slide
      class="fixed left-2 bottom-2 z-10 min-h-[20px] min-w-[100px] max-w-[90%] rounded-lg border-2 border-[red] bg-[aliceblue] p-1 pl-1.5"
    >
      <div class="font-semibold">
        {lekh.upload_msg} - <span class="text-[brown]">{fileName}</span>
      </div>
      <div class="text-lg font-semibold">
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
