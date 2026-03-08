<script lang="ts">
	import { cn } from '../../utils.ts';
	import type { ComponentProps } from 'svelte';
	import { Separator } from '../separator/index.ts';
	let { ref = $bindable(null), class: className, orientation = 'vertical', ...restProps }: ComponentProps<typeof Separator> = $props();
</script>

<Separator bind:ref data-slot="button-group-separator" {orientation} class={cn('bg-input relative !m-0 self-stretch data-[orientation=vertical]:h-auto', className)} {...restProps} />
