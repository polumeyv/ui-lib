<script lang="ts">
import type { Component } from 'svelte';
import { cn } from '../../utils.ts';

type Tab = {
	id: string;
	label?: string;
	href?: string;
	icon?: Component<{ class?: string }>;
};

let {
	tabs = [],
	activeTab = '',
	onchange,
	class: className,
}: {
	tabs?: (string | Tab)[];
	activeTab?: string;
	onchange?: (id: string) => void;
	class?: string;
} = $props();

const normalizedTabs = $derived(
	tabs.map((t) => (typeof t === 'string' ? { id: t.toLowerCase(), label: t } : t))
);

let tabEls = $state<Record<string, HTMLElement | undefined>>({});

const indicator = $derived.by(() => {
	const el = tabEls[activeTab];
	if (!el) return { x: 0, width: 0 };
	return { x: el.offsetLeft, width: el.offsetWidth };
});
</script>

<nav data-slot="heading-nav" class={cn('w-full border-b mb-2 md:mb-4 lg:mb-6 min-h-9', className)}>
	{#if normalizedTabs.length > 0}
		<div role="tablist" aria-orientation="horizontal" class="relative inline-flex">
			{#each normalizedTabs as tab (tab.id)}
				{@const isActive = activeTab === tab.id}
				{@const Icon = tab.icon}

				<svelte:element
					this={tab.href ? 'a' : 'button'}
					bind:this={tabEls[tab.id]}
					href={tab.href}
					type={!tab.href ? 'button' : undefined}
					role="tab"
					aria-selected={isActive}
					aria-current={tab.href && isActive ? 'page' : undefined}
					tabindex={isActive ? 0 : -1}
					onclick={!tab.href ? () => onchange?.(tab.id) : undefined}
					class="relative z-10 flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap {isActive
						? 'text-foreground'
						: 'text-muted-foreground hover:text-foreground'}"
				>
					{#if Icon}<Icon class="size-4" />{/if}
					{tab.label}
				</svelte:element>
			{/each}

			<div
				role="presentation"
				class="absolute bottom-0 left-0 h-0.5 bg-primary transition-[transform,width] duration-200 ease-out motion-reduce:transition-none"
				style:transform="translateX({indicator.x}px)"
				style:width="{indicator.width}px"
			></div>
		</div>
	{/if}
</nav>
