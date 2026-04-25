import DatePicker from './date-picker.svelte';
import DatePickerWithPresets from './date-picker-with-presets.svelte';
import DateRangePicker from './date-range-picker.svelte';
import { CalendarDate, today as getToday, getLocalTimeZone } from '@internationalized/date';

export type TimeRange = { start: string; end: string };

export const CalendarUtils = {
	today: () => getToday(getLocalTimeZone()),
	tomorrow: () => getToday(getLocalTimeZone()).add({ days: 1 }),
	getMaxCalendarDateMonths: (months: number) => getToday(getLocalTimeZone()).add({ months }),
};

export namespace CalendarUtils {
	export type TimeRange = { start: string; end: string };
}

export {
	DatePicker,
	DateRangePicker,
	DatePickerWithPresets,
	CalendarDate,
	//
	DatePicker as Root,
	DateRangePicker as Range,
	DatePickerWithPresets as WithPresets,
};
