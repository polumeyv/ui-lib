<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="min-h-screen bg-background flex flex-col max-w-7xl p-4 mx-auto">
	{@render children()}
</div>
