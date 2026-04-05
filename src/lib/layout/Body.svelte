<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		/** Main page content */
		children: Snippet;
		/** Optional header snippet (rendered before main) */
		header?: Snippet;
		/** Optional footer snippet (rendered after main) */
		footer?: Snippet;
	}

	let { children, header, footer }: Props = $props();
</script>

<div class="min-h-screen bg-background flex flex-col">
	{#if header}
		{@render header()}
	{/if}

	<main class="flex-1">
		{@render children()}
	</main>

	{#if footer}
		{@render footer()}
	{/if}
</div>
