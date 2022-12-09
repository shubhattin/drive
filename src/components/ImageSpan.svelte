<script lang="ts">
  export let className = '';
  export let src: string;
</script>

<span class={`inline-block bg-cover ${className}`} style:background-image={`url(${src})`} />
