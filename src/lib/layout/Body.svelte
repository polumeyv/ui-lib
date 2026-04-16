<script lang="ts">
	import Separator from '$lib/components/separator/separator.svelte';
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
		/** Footer navigation links */
		links?: { href: string; label: string }[];
		/** Copyright text (defaults to current year Polumeyv LLC) */
		copyright?: string;
	};

	let { children, links = [], copyright = `\u00A9 ${new Date().getFullYear()} Polumeyv LLC. All rights reserved.` }: Props = $props();
</script>

<div class="bg-background flex flex-col max-w-7xl px-4 mx-auto">
	<div class="min-h-screen">
		{@render children()}
	</div>

	<Separator />

	<footer class="border-t border-border/40 px-6 py-12">
		<div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
			<p class="text-sm text-muted-foreground">{copyright}</p>
			{#if links.length > 0}
				<div class="flex gap-6 text-sm text-muted-foreground [&_a]:hover:text-foreground">
					{#each links as link (link.href)}
						<a href={link.href}>{link.label}</a>
					{/each}
				</div>
			{/if}
		</div>
	</footer>
</div>
