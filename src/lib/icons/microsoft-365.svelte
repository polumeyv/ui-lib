<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements';
	let { class: className, ...rest }: SVGAttributes<SVGSVGElement> = $props();
</script>

<svg viewBox="0 0 48 48" class="ms-logo {className}" {...rest}>
	<path fill="#0078d4" d="M6 6h16v16H6zm20 0h16v16H26zM6 26h16v16H6zm20 0h16v16H26z" />
</svg>
