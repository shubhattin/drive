<script lang="ts">
  import { lekhAH, selectedFiles, currentLoc, files, filesToMove } from '@state/drive';
  import Icon from '@tools/Icon.svelte';
  import { slide } from 'svelte/transition';
  import CgClose from 'svelte-icons-pack/cg/CgClose';
  import { set_val_from_adress } from '@tools/json';
  import { to_base64 } from '@tools/kry/gupta';
  import { toast } from '@tools/toast';
  import { client } from '@api/client';
  import { ensure_jwt_status } from '@tools/drive/request';

  $: lekh = $lekhAH.fileBar.MoveFile;

  const registerFilesToMove = () => {
    if ($selectedFiles.length === 0) return;
    $filesToMove = {
      path: $currentLoc,
      files: JSON.parse(JSON.stringify($selectedFiles))
    };
    $selectedFiles = [];
    clicked = true;
  };
  const onPasteDialogBoxCloseBtnClick = () => {
    clicked = false;
    $filesToMove = null!;
  };
  const onPasteBtnClick = async () => {
    if ($filesToMove.path === $currentLoc) return;
    let prefix = $currentLoc;
    if (prefix === '/') prefix = '';
    for (let file of $filesToMove.files) {
      if (true) {
        // deleting the original path
        let current_prefix = $filesToMove.path;
        if (current_prefix === '/') current_prefix = '';
        set_val_from_adress(`${current_prefix}/${file.name}`, $files, -2);
      }
      // adding the new path
      file.name = `${prefix}/${file.name}`;
      set_val_from_adress(file.name, $files, file);
    }
    if (true) {
      // making change in dataabase
      const names = $filesToMove.files.map((file) => {
        return to_base64(file.name);
      });
      const keys = $filesToMove.files.map((file) => file.key);
      await ensure_jwt_status();
      await client.drive.move_file.mutate({
        keys: keys,
        names: names
      });
    }
    toast.success(`${lekh.moved_msg}`, 2000, 'bottom-right');
    $filesToMove = null!;
    $files = $files;
    clicked = false;
  };
  let clicked = false;
</script>

<span class="mr-2">
  <button on:click={registerFilesToMove}>
    <svg
      class="flex-no-shrink h-7 w-7 fill-current active:text-blue-700"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      ><path
        fill="currentColor"
        d="m12.2 14l-.925.925q-.275.275-.275.7t.275.7q.275.275.7.275t.7-.275L15.3 13.7q.3-.3.3-.7t-.3-.7l-2.625-2.625q-.275-.275-.7-.275t-.7.275q-.275.275-.275.7t.275.7L12.2 12H9q-.425 0-.713.288T8 13q0 .425.288.713T9 14h3.2ZM4 20q-.825 0-1.413-.588T2 18V6q0-.825.588-1.413T4 4h5.175q.4 0 .763.15t.637.425L12 6h8q.825 0 1.413.588T22 8v10q0 .825-.588 1.413T20 20H4ZM4 6v12h16V8h-8.825l-2-2H4Zm0 0v12V6Z"
      /></svg
    >
  </button>
  {#if clicked}
    <div
      in:slide
      out:slide
      class="absolute z-10 -mt-10 rounded-lg border-2 border-blue-700 bg-yellow-50 p-1"
    >
      <button on:click={onPasteBtnClick} class="active:text-green-600">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
          ><path
            fill="currentColor"
            d="M10 17c0-3.31 2.69-6 6-6h3V5h-2v3H7V5H5v14h5v-2z"
            opacity=".3"
          /><path
            fill="currentColor"
            d="M10 19H5V5h2v3h10V5h2v6h2V5c0-1.1-.9-2-2-2h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h5v-2zm2-16c.55 0 1 .45 1 1s-.45 1-1 1s-1-.45-1-1s.45-1 1-1z"
          /><path
            fill="currentColor"
            d="m18.01 13l-1.42 1.41l1.58 1.58H12v2h6.17l-1.58 1.59l1.42 1.41l3.99-4z"
          /></svg
        >
      </button>
      <button on:click={onPasteDialogBoxCloseBtnClick}>
        <Icon
          src={CgClose}
          className="flex-no-shrink h-7 w-7 fill-current active:text-black text-red-600"
        />
      </button>
    </div>
  {/if}
</span>
