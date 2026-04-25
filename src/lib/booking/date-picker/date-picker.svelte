<script lang="ts">
import CalendarIcon from '@lucide/svelte/icons/calendar';
import { DateFormatter, type DateValue, getLocalTimeZone, parseDate } from '@internationalized/date';
import { cn } from '../../utils.js';
import { buttonVariants } from '../../components/button/index.js';
import { Calendar } from '../calendar/index.js';
import * as Popover from '../../components/popover/index.js';

interface Props {
	value?: DateValue;
	valueAsString?: string;
	placeholder?: string;
	dateFormat?: Intl.DateTimeFormatOptions['dateStyle'];
	locale?: string;
	disabled?: boolean;
	class?: string;
	triggerClass?: string;
	contentClass?: string;
	align?: 'start' | 'center' | 'end';
	side?: 'top' | 'right' | 'bottom' | 'left';
	onValueChange?: (value: DateValue | undefined) => void;
	onValueStringChange?: (value: string) => void;
	// Calendar props
	captionLayout?: 'dropdown' | 'dropdown-months' | 'dropdown-years' | 'label';
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
	placeholder = 'Pick a date',
	dateFormat = 'long',
	locale = 'en-US',
	disabled = false,
	class: className,
	triggerClass,
	contentClass,
	align = 'start',
	side = 'bottom',
	captionLayout = 'dropdown',
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

// Sync valueAsString -> value (on mount or external change)
$effect(() => {
	if (valueAsString && !value) {
		try {
			value = parseDate(valueAsString);
		} catch {
			// Invalid date string, ignore
		}
	}
});

// Sync value -> valueAsString
$effect(() => {
	if (value) {
		const str = value.toString();
		if (str !== valueAsString) {
			valueAsString = str;
			onValueStringChange?.(str);
		}
	} else if (valueAsString && !value) {
		valueAsString = '';
		onValueStringChange?.('');
	}
});

const df = $derived(
	new DateFormatter(locale, {
		dateStyle: dateFormat,
	}),
);

const displayValue = $derived(value ? df.format(value.toDate(getLocalTimeZone())) : placeholder);

function handleValueChange(newValue: DateValue | undefined) {
	value = newValue;
	onValueChange?.(newValue);
}
</script>

<div class={cn("grid gap-2", className)}>
  <Popover.Root>
    <Popover.Trigger
      {disabled}
      class={cn(
        buttonVariants({
          variant: "outline",
          class: "w-70 justify-start text-start font-normal"
        }),
        !value && "text-muted-foreground",
        triggerClass
      )}
    >
      <CalendarIcon class="size-4" />
      {displayValue}
    </Popover.Trigger>
    <Popover.Content class={cn("w-auto p-0", contentClass)} {align} {side}>
      <Calendar
        type="single"
        bind:value
        onValueChange={handleValueChange}
        {captionLayout}
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
