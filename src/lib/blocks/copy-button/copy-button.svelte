<script lang="ts">
	import { Button, type ButtonVariant, type ButtonSize } from '../../components/button/index.ts';
	import Check from '@lucide/svelte/icons/check';
	import Copy from '@lucide/svelte/icons/copy';
	import { cn } from '../../utils.ts';

	interface Props {
		/** Text to copy to clipboard */
		text: string;
		/** Button variant */
		variant?: ButtonVariant;
		/** Button size */
		size?: ButtonSize;
		/** Optional additional class */
		class?: string;
	}

	let { text, variant = 'ghost', size = 'icon', class: className }: Props = $props();
	let copied = $state(false);

	function copy() {
		navigator.clipboard.writeText(text);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<Button {size} {variant} class={cn('size-6', className)} onclick={copy}>
	{#if copied}<Check class="size-3" />{:else}<Copy class="size-3" />{/if}
</Button>
