<script lang="ts">
	import { cn, type WithElementRef } from '../../utils.ts';
	import type { HTMLAttributes } from 'svelte/elements';
	let {
		ref = $bindable(null),
		class: className,
		variant = 'legend',
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLLegendElement>> & {
		variant?: 'legend' | 'label';
	} = $props();
</script>

<legend bind:this={ref} data-slot="field-legend" data-variant={variant} class={cn('mb-3 font-medium', 'data-[variant=legend]:text-lg', 'data-[variant=label]:text-sm', className)} {...restProps}>
	{@render children?.()}
</legend>
