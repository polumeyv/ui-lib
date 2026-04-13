<script lang="ts">
	import { cn, type WithElementRef, type WithoutChildren } from '../../utils.ts';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getPayloadConfigFromPayload, useChart } from './chart-utils.ts';
	import { getChartContext, Tooltip as TooltipPrimitive, type TooltipSeries } from 'layerchart';
	import type { Snippet } from 'svelte';

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function defaultFormatter(value: any, _series: TooltipSeries[]) {
		return `${value}`;
	}

	let {
		ref = $bindable(null),
		class: className,
		hideLabel = false,
		indicator = 'dot',
		hideIndicator = false,
		labelKey,
		label,
		labelFormatter = defaultFormatter,
		labelClassName,
		formatter,
		nameKey,
		color,
		...restProps
	}: WithoutChildren<WithElementRef<HTMLAttributes<HTMLDivElement>>> & {
		hideLabel?: boolean;
		label?: string;
		indicator?: 'line' | 'dot' | 'dashed';
		nameKey?: string;
		labelKey?: string;
		hideIndicator?: boolean;
		labelClassName?: string;
		labelFormatter?: // eslint-disable-next-line @typescript-eslint/no-explicit-any
		((value: any, series: TooltipSeries[]) => string | number | Snippet) | null;
		formatter?: Snippet<
			[
				{
					value: unknown;
					name: string;
					item: TooltipSeries;
					index: number;
					series: TooltipSeries[];
				},
			]
		>;
	} = $props();

	const chart = useChart();
	const chartCtx = getChartContext();

	const visibleSeries = $derived(chartCtx.tooltip.series.filter((s) => s.visible && s.value !== undefined));
	const tooltipData = $derived(chartCtx.tooltip.data);

	const formattedLabel = $derived.by(() => {
		if (hideLabel || !visibleSeries.length) return null;

		const [item] = visibleSeries;
		if (!item) return null;
		const key = labelKey ?? item.label ?? item.key ?? 'value';

		const itemConfig = getPayloadConfigFromPayload(chart.config, item, key, tooltipData);

		const value = !labelKey && typeof label === 'string' ? (chart.config[label as keyof typeof chart.config]?.label ?? label) : (itemConfig?.label ?? item.label);

		if (value === undefined) return null;
		if (!labelFormatter) return value;
		return labelFormatter(value, visibleSeries);
	});

	const nestLabel = $derived(visibleSeries.length === 1 && indicator !== 'dot');
</script>

{#snippet TooltipLabel()}
	{#if formattedLabel}
		<div class={cn('font-medium', labelClassName)}>
			{#if typeof formattedLabel === 'function'}
				{@render formattedLabel()}
			{:else}
				{formattedLabel}
			{/if}
		</div>
	{/if}
{/snippet}

<TooltipPrimitive.Root variant="none">
	<div bind:this={ref} class={cn('border-border/50 bg-background grid min-w-[9rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl', className)} {...restProps}>
		{#if !nestLabel}
			{@render TooltipLabel()}
		{/if}
		<div class="grid gap-1.5">
			{#each visibleSeries as item, i (item.key + i)}
				{@const key = `${nameKey || item.key || 'value'}`}
				{@const itemConfig = getPayloadConfigFromPayload(chart.config, item, key, tooltipData)}
				{@const indicatorColor = color || item.color}
				<div class={cn('[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:size-2.5', indicator === 'dot' && 'items-center')}>
					{#if formatter && item.value !== undefined && item.label}
						{@render formatter({
							value: item.value,
							name: item.label,
							item,
							index: i,
							series: visibleSeries,
						})}
					{:else}
						{#if itemConfig?.icon}
							<itemConfig.icon />
						{:else if !hideIndicator}
							<div
								style="--color-bg: {indicatorColor}; --color-border: {indicatorColor};"
								class={cn('shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)', {
									'size-2.5': indicator === 'dot',
									'h-full w-1': indicator === 'line',
									'w-0 border-[1.5px] border-dashed bg-transparent': indicator === 'dashed',
									'my-0.5': nestLabel && indicator === 'dashed',
								})}>
							</div>
						{/if}
						<div class={cn('flex flex-1 shrink-0 justify-between leading-none', nestLabel ? 'items-end' : 'items-center')}>
							<div class="grid gap-1.5">
								{#if nestLabel}
									{@render TooltipLabel()}
								{/if}
								<span class="text-muted-foreground">
									{itemConfig?.label || item.label}
								</span>
							</div>
							{#if item.value !== undefined}
								<span class="text-foreground font-mono font-medium tabular-nums">
									{typeof item.value === 'number' ? item.value.toLocaleString() : String(item.value)}
								</span>
							{/if}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</TooltipPrimitive.Root>
