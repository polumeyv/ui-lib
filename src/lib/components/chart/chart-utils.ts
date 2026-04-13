import type { TooltipSeries } from 'layerchart';
import { type Component, getContext, setContext } from 'svelte';

export const THEMES = { light: '', dark: '.dark' } as const;

export type ChartConfig = {
	[k in string]: {
		label?: string;
		icon?: Component;
	} & ({ color?: string; theme?: never } | { color?: never; theme: Record<keyof typeof THEMES, string> });
};

export type TooltipPayload = TooltipSeries;

// Helper to extract item config from a series item. `data` is the raw data row (TooltipState.data).
export function getPayloadConfigFromPayload(config: ChartConfig, item: TooltipSeries, key: string, data?: unknown) {
	if (typeof item !== 'object' || item === null) return undefined;

	const row = typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : undefined;

	let configLabelKey: string = key;

	if (item.key === key) {
		configLabelKey = item.key;
	} else if (key in item && typeof (item as Record<string, unknown>)[key] === 'string') {
		configLabelKey = (item as Record<string, unknown>)[key] as string;
	} else if (row !== undefined && key in row && typeof row[key] === 'string') {
		configLabelKey = row[key] as string;
	}

	return configLabelKey in config ? config[configLabelKey] : config[key as keyof typeof config];
}

type ChartContextValue = {
	config: ChartConfig;
};

const chartContextKey = Symbol('chart-context');

export function setChartContext(value: ChartContextValue) {
	return setContext(chartContextKey, value);
}

export function useChart() {
	return getContext<ChartContextValue>(chartContextKey);
}
