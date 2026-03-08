<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title?: string;
		children: Snippet;
	}

	let { title = '', children }: Props = $props();
</script>

<div class="w-full overflow-hidden rounded-xl border bg-card shadow-2xl">
	<!-- Title Bar -->
	<div class="flex items-center gap-2 border-b bg-muted/50 px-3 py-2 sm:px-4 sm:py-3">
		<div class="flex gap-1.5">
			<div class="size-2.5 rounded-full bg-red-500 sm:size-3"></div>
			<div class="size-2.5 rounded-full bg-yellow-500 sm:size-3"></div>
			<div class="size-2.5 rounded-full bg-green-500 sm:size-3"></div>
		</div>
		{#if title}
			<span class="ml-2 truncate text-xs text-muted-foreground">{title}</span>
		{/if}
	</div>

	<!-- Content -->
	<div class="min-w-0">
		{@render children()}
	</div>
</div>
