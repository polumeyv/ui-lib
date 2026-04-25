<script lang="ts">
import CalendarIcon from '@lucide/svelte/icons/calendar';
import type { DateRange } from 'bits-ui';
import { DateFormatter, type DateValue, getLocalTimeZone, parseDate } from '@internationalized/date';
import { cn } from '../../utils.js';
import { buttonVariants } from '../../components/button/index.js';
import { RangeCalendar } from '../range-calendar/index.js';
import * as Popover from '../../components/popover/index.js';

type DateRangeString = {
	start?: string;
	end?: string;
};

interface Props {
	value?: DateRange;
	valueAsString?: DateRangeString;
	placeholder?: string;
	dateFormat?: Intl.DateTimeFormatOptions['dateStyle'];
	locale?: string;
	disabled?: boolean;
	class?: string;
	triggerClass?: string;
	contentClass?: string;
	align?: 'start' | 'center' | 'end';
	side?: 'top' | 'right' | 'bottom' | 'left';
	onValueChange?: (value: DateRange | undefined) => void;
	onValueStringChange?: (value: DateRangeString) => void;
	// Calendar props
	numberOfMonths?: number;
	minValue?: DateValue;
	maxValue?: DateValue;
	weekdayFormat?: 'short' | 'long' | 'narrow';
	calendarLabel?: string;
	fixedWeeks?: boolean;
	isDateDisabled?: (date: DateValue) => boolean;
	isDateUnavailable?: (date: DateValue) => boolean;
}

let {
	value = $bindable(),
	valueAsString = $bindable(),
	placeholder = 'Pick a date range',
	dateFormat = 'medium',
	locale = 'en-US',
	disabled = false,
	class: className,
	triggerClass,
	contentClass,
	align = 'start',
	side = 'bottom',
	numberOfMonths = 2,
	onValueChange,
	onValueStringChange,
	minValue,
	maxValue,
	weekdayFormat,
	calendarLabel,
	fixedWeeks,
	isDateDisabled,
	isDateUnavailable,
}: Props = $props();

let startValue: DateValue | undefined = $state(undefined);

// Sync valueAsString -> value (on mount or external change)
$effect(() => {
	if (valueAsString?.start && !value?.start) {
		try {
			const start = parseDate(valueAsString.start);
			const end = valueAsString.end ? parseDate(valueAsString.end) : undefined;
			value = { start, end };
		} catch {
			// Invalid date string, ignore
		}
	}
});

// Sync value -> valueAsString
$effect(() => {
	if (value?.start) {
		const newString: DateRangeString = {
			start: value.start.toString(),
			end: value.end?.toString(),
		};
		if (newString.start !== valueAsString?.start || newString.end !== valueAsString?.end) {
			valueAsString = newString;
			onValueStringChange?.(newString);
		}
	}
});

const df = $derived(
	new DateFormatter(locale, {
		dateStyle: dateFormat,
	}),
);

const displayValue = $derived.by(() => {
	if (value?.start) {
		if (value.end) {
			return `${df.format(value.start.toDate(getLocalTimeZone()))} - ${df.format(value.end.toDate(getLocalTimeZone()))}`;
		}
		return df.format(value.start.toDate(getLocalTimeZone()));
	}
	if (startValue) {
		return df.format(startValue.toDate(getLocalTimeZone()));
	}
	return placeholder;
});

function handleValueChange(newValue: DateRange | undefined) {
	value = newValue;
	onValueChange?.(newValue);
}
</script>

<div class={cn("grid gap-2", className)}>
  <Popover.Root>
    <Popover.Trigger
      {disabled}
      class={cn(
        buttonVariants({ variant: "outline" }),
        "justify-start text-start font-normal",
        !value && "text-muted-foreground",
        triggerClass
      )}
    >
      <CalendarIcon class="me-2 size-4" />
      {displayValue}
    </Popover.Trigger>
    <Popover.Content class={cn("w-auto p-0", contentClass)} {align} {side}>
      <RangeCalendar
        bind:value
        onValueChange={handleValueChange}
        onStartValueChange={(v) => {
          startValue = v;
        }}
        {numberOfMonths}
        {minValue}
        {maxValue}
        {weekdayFormat}
        {calendarLabel}
        {fixedWeeks}
        {isDateDisabled}
        {isDateUnavailable}
      />
    </Popover.Content>
  </Popover.Root>
</div>
