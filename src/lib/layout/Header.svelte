<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Button } from '../components/button';
	import { ThemeToggle } from '../components/theme-toggle';
	import * as Sheet from '../components/sheet';
	import Menu from '@lucide/svelte/icons/menu';

	interface Props {
		/** Brand name or text displayed as logo link */
		brand: string;
		/** URL the brand links to */
		brandHref?: string;
		/** Navigation links */
		navLinks?: { href: string; label: string }[];
		/** Primary action button (e.g., login/dashboard) */
		action?: { href: string; label: string };
		/** Whether to show theme toggle (default true) */
		showThemeToggle?: boolean;
		/** Optional snippet for custom right-side content before the action button */
		children?: Snippet;
	}

	let { brand, brandHref = '/', navLinks = [], action, showThemeToggle = true, children }: Props = $props();

	let mobileMenuOpen = $state(false);
</script>

<nav class="sticky top-0 z-50 border-b border-border/40 bg-background/80 py-3 backdrop-blur-sm">
	<div class="mx-auto flex h-16 max-w-8xl items-center justify-between px-16">
		<!-- Left: brand link + desktop nav links -->
		<div class="gap-10 md:flex items-center">
			<a href={brandHref} class="text-xl font-bold">{brand}</a>
			<div class="hidden md:flex gap-6">
				{#each navLinks as link (link.href)}
					<a href={link.href} class="text-sm transition-colors hover:text-muted-foreground">
						{link.label}
					</a>
				{/each}
			</div>
		</div>

		<!-- Right: optional children + theme toggle + action button + mobile sheet -->
		<div class="flex items-center gap-2">
			{@render children?.()}
			{#if showThemeToggle}<ThemeToggle />{/if}
			{#if action}<Button class="hidden md:inline-flex" href={action.href}>{action.label}</Button>{/if}
			<!-- Mobile Sheet menu (md:hidden trigger) -->
			<Sheet.Root bind:open={mobileMenuOpen}>
				<Sheet.Trigger>
					{#snippet child({ props })}
						<Button {...props} variant="ghost" size="icon" class="md:hidden">
							<Menu /><span class="sr-only">Open menu</span>
						</Button>
					{/snippet}
				</Sheet.Trigger>
				<Sheet.Content side="right" class="w-72">
					<Sheet.Header>
						<Sheet.Title>{brand}</Sheet.Title>
					</Sheet.Header>
					<nav class="flex flex-col gap-4 px-4 py-6">
						{#each navLinks as link (link.href)}
							<a href={link.href} class="text-lg font-medium text-foreground transition-colors hover:text-primary" onclick={() => (mobileMenuOpen = false)}>
								{link.label}
							</a>
						{/each}
					</nav>
					{#if action}
						<div class="border-t mx-4 pt-6">
							<Button href={action.href} onclick={() => (mobileMenuOpen = false)}>
								{action.label}
							</Button>
						</div>
					{/if}
				</Sheet.Content>
			</Sheet.Root>
		</div>
	</div>
</nav>
