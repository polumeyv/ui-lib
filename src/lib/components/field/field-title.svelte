<script lang="ts">
	import { cn, type WithElementRef } from '../../utils.ts';
	import type { HTMLAttributes } from 'svelte/elements';
	let { ref = $bindable(null), class: className, children, ...restProps }: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div bind:this={ref} data-slot="field-title" class={cn('flex w-fit items-center gap-2 leading-snug text-xl font-medium group-data-[disabled=true]/field:opacity-50', className)} {...restProps}>
	{@render children?.()}
</div>
