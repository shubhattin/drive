<script lang="ts">
  export let per: number;
</script>

<div class="w-[75vw] border-2 border-black p-[3px] rounded mr-1">
  <div class="bg-[green] rounded-md h-4 max-w-[100%] transition-all" style:width={`${per}%`} />
</div>
