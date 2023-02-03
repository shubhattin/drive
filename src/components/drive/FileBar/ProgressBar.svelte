<script lang="ts">
  export let per: number;
</script>

<div class="mr-1 w-[75vw] rounded border-2 border-black p-[3px]">
  <div class="h-4 max-w-[100%] rounded-md bg-[green] transition-all" style:width={`${per}%`} />
</div>
