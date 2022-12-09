<script>
  export let src;
  export let title = undefined;
  export let className = '';
  export let viewBox = undefined;
  let innerHtml;

  $: {
    innerHtml = (title ? `<title>${title}</title>` : '') + src.c;
  }
</script>

<svg
  stroke="currentColor"
  fill="currentColor"
  stroke-width="0"
  class={className}
  {viewBox}
  height="1em"
  width="1em"
  {...src.a}
  xmlns="http://www.w3.org/2000/svg"
>
  {@html innerHtml}
</svg>
