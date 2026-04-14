<script lang="ts">
	import { cn } from '../../utils';

	type Tab = { id: string; label: string; href: string };

	let {
		tabs,
		activeTab,
		class: className,
	}: {
		tabs: Tab[];
		activeTab: string;
		class?: string;
	} = $props();

	let tabEls: Record<string, HTMLAnchorElement> = $state({});

	const indicator = $derived.by(() => {
		const el = tabEls[activeTab];
		if (!el) return { width: 0, left: 0 };
		return { width: el.offsetWidth, left: el.offsetLeft };
	});
</script>

<div class={cn('relative', className)} role="tablist" aria-orientation="horizontal">
	<div class="flex gap-4">
		{#each tabs as tab (tab.id)}
			<a
				bind:this={tabEls[tab.id]}
				href={tab.href}
				role="tab"
				aria-selected={activeTab === tab.id}
				class="relative px-1 pb-2.5 text-sm font-medium transition-colors {activeTab === tab.id
					? 'text-foreground'
					: 'text-muted-foreground hover:text-foreground/80'}">
				{tab.label}
			</a>
		{/each}
	</div>
	<div
		class="absolute bottom-0 left-0 h-[2px] rounded-full bg-foreground transition-all duration-150 ease-in-out"
		style="width: {indicator.width}px; transform: translateX({indicator.left}px);"></div>
	<div class="absolute bottom-0 left-0 right-0 h-px bg-border"></div>
</div>
