/**
 * Shared booking utilities — single source of truth for both client and server.
 *
 * Covers: compact URL param encoding (via Effect Schema transforms),
 * field encoding for booking sessions, time/date formatting.
 */
import { Schema, DateTime, ParseResult } from 'effect';

const p = (n: number) => String(n).padStart(2, '0');
/**
 * YYYY-MM ↔ { year, month }
 * Used by GET /book/month/:slug?t=YYYY-MM
 */
export const MonthParam = Schema.transformOrFail(Schema.String.pipe(Schema.pattern(/^\d{4}-\d{2}$/)), Schema.Struct({ year: Schema.Number, month: Schema.Number }), {
	strict: true,
	decode: (s, _, ast) => {
		const year = parseInt(s.slice(0, 4), 10);
		const month = parseInt(s.slice(5, 7), 10);
		if (month < 1 || month > 12) return ParseResult.fail(new ParseResult.Type(ast, s));
		return ParseResult.succeed({ year, month });
	},
	encode: ({ year, month }) => ParseResult.succeed(`${year}-${p(month)}`),
});

/**
 * YYYY-MM-DD ↔ { year, month, day }
 * Used by GET /book/day/:slug?t=YYYY-MM-DD
 */
export const DayParam = Schema.transformOrFail(Schema.String.pipe(Schema.pattern(/^\d{4}-\d{2}-\d{2}$/)), Schema.Struct({ year: Schema.Number, month: Schema.Number, day: Schema.Number }), {
	strict: true,
	decode: (s, _, ast) => {
		const year = parseInt(s.slice(0, 4), 10);
		const month = parseInt(s.slice(5, 7), 10);
		const day = parseInt(s.slice(8, 10), 10);
		if (month < 1 || month > 12 || day < 1 || day > 31) return ParseResult.fail(new ParseResult.Type(ast, s));
		return ParseResult.succeed({ year, month, day });
	},
	encode: ({ year, month, day }) => ParseResult.succeed(`${year}-${p(month)}-${p(day)}`),
});

/**
 * YYMMDDYYMMDD ↔ { from: { year, month, day }, to: { year, month, day } }
 * Used by internal endpoints for date range queries: ?t=260414260418
 */
const dateSlice = (s: string, off: number) => {
	const year = 2000 + parseInt(s.slice(off, off + 2), 10);
	const month = parseInt(s.slice(off + 2, off + 4), 10);
	const day = parseInt(s.slice(off + 4, off + 6), 10);
	return { year, month, day, valid: month >= 1 && month <= 12 && day >= 1 && day <= 31 };
};

export const DateRangeParam = Schema.transformOrFail(
	Schema.String.pipe(Schema.pattern(/^\d{12}$/)),
	Schema.Struct({
		from: Schema.Struct({ year: Schema.Number, month: Schema.Number, day: Schema.Number }),
		to: Schema.Struct({ year: Schema.Number, month: Schema.Number, day: Schema.Number }),
	}),
	{
		strict: true,
		decode: (s, _, ast) => {
			const f = dateSlice(s, 0);
			const t = dateSlice(s, 6);
			if (!f.valid || !t.valid) return ParseResult.fail(new ParseResult.Type(ast, s));
			return ParseResult.succeed({ from: { year: f.year, month: f.month, day: f.day }, to: { year: t.year, month: t.month, day: t.day } });
		},
		encode: ({ from, to }) => ParseResult.succeed(p(from.year - 2000) + p(from.month) + p(from.day) + p(to.year - 2000) + p(to.month) + p(to.day)),
	},
);

/**
 * YYYY-MM-DDTHHmmHHmm ↔ { year, month, day, startH, startM, endH, endM }
 * Wall-clock representation — timezone-agnostic. Callers must combine with the
 * business's IANA timezone (e.g. via Postgres `AT TIME ZONE`) to produce an instant.
 * Used by POST /book/time/:slug?t=YYYY-MM-DDTHHmmHHmm
 */
export const TimeParam = Schema.transformOrFail(
	Schema.String.pipe(Schema.pattern(/^\d{4}-\d{2}-\d{2}T\d{8}$/)),
	Schema.Struct({
		year: Schema.Number,
		month: Schema.Number,
		day: Schema.Number,
		startH: Schema.Number,
		startM: Schema.Number,
		endH: Schema.Number,
		endM: Schema.Number,
	}),
	{
		strict: true,
		decode: (s, _, ast) => {
			const year = parseInt(s.slice(0, 4), 10);
			const month = parseInt(s.slice(5, 7), 10);
			const day = parseInt(s.slice(8, 10), 10);
			const startH = parseInt(s.slice(11, 13), 10);
			const startM = parseInt(s.slice(13, 15), 10);
			const endH = parseInt(s.slice(15, 17), 10);
			const endM = parseInt(s.slice(17, 19), 10);

			if (month < 1 || month > 12 || day < 1 || day > 31) return ParseResult.fail(new ParseResult.Type(ast, s));
			if (startH > 23 || endH > 23 || startM > 59 || endM > 59) return ParseResult.fail(new ParseResult.Type(ast, s));
			if (endH * 60 + endM <= startH * 60 + startM) return ParseResult.fail(new ParseResult.Type(ast, s));

			return ParseResult.succeed({ year, month, day, startH, startM, endH, endM });
		},
		encode: ({ year, month, day, startH, startM, endH, endM }) =>
			ParseResult.succeed(`${year}-${p(month)}-${p(day)}T${p(startH)}${p(startM)}${p(endH)}${p(endM)}`),
	},
);

/**
 * HHmmHHmm ↔ { startH, startM, endH, endM }
 * Used by the client to interpret the response from GET /book/day.
 */
export const SlotString = Schema.transform(
	Schema.String.pipe(Schema.pattern(/^\d{8}$/)),
	Schema.Struct({ startH: Schema.Number, startM: Schema.Number, endH: Schema.Number, endM: Schema.Number }),
	{
		strict: true,
		decode: (s) => ({
			startH: parseInt(s.slice(0, 2), 10),
			startM: parseInt(s.slice(2, 4), 10),
			endH: parseInt(s.slice(4, 6), 10),
			endM: parseInt(s.slice(6, 8), 10),
		}),
		encode: ({ startH, startM, endH, endM }) => p(startH) + p(startM) + p(endH) + p(endM),
	},
);

/**
 * uuid_fields ↔ { uuid, fields }
 * Session ID encoding: "abc-123_fnlnem-phnt"
 */
export const Sid = Schema.transform(
	Schema.String.pipe(Schema.pattern(/^[0-9a-f-]+_[a-z0-9]+-[a-z0-9]+$/)),
	Schema.Struct({ uuid: Schema.String, fields: Schema.String }),
	{
		strict: true,
		decode: (s) => {
			const idx = s.indexOf('_');
			return { uuid: s.slice(0, idx), fields: s.slice(idx + 1) };
		},
		encode: ({ uuid, fields }) => `${uuid}_${fields}`,
	},
);

/**
 * "fnlnem-phnt" ↔ { required: string[], optional: string[] }
 * Field encoding: two-char codes split by hyphen.
 */
export const FieldEncoding = Schema.transform(
	Schema.String.pipe(Schema.pattern(/^[a-z0-9]+-[a-z0-9]*$/)),
	Schema.Struct({ required: Schema.Array(Schema.String), optional: Schema.Array(Schema.String) }),
	{
		strict: true,
		decode: (s) => {
			const [reqStr = '', optStr = ''] = s.split('-');
			const split = (v: string) => v.match(/.{2}/g) ?? [];
			return { required: split(reqStr), optional: split(optStr) };
		},
		encode: ({ required, optional }) => required.join('') + '-' + optional.join(''),
	},
);

// ══════════════════════════════════════════════════════════════════════════════
// PLAIN DECODERS (throw on invalid input — for server routes)
// ══════════════════════════════════════════════════════════════════════════════

const decodeMonth = Schema.decodeUnknownSync(MonthParam);
const decodeDay = Schema.decodeUnknownSync(DayParam);
const decodeDateRange = Schema.decodeUnknownSync(DateRangeParam);
const decodeTime = Schema.decodeUnknownSync(TimeParam);
const decodeSid = Schema.decodeUnknownSync(Sid);
const encodeSlotString = Schema.encodeSync(SlotString);
const decodeFieldEncoding = Schema.decodeUnknownSync(FieldEncoding);

const bad = (msg: string): never => {
	throw Object.assign(new Error(msg), { status: 400 });
};

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,62}[a-z0-9]$/;

export const parseSlug = (v: unknown): string => (typeof v === 'string' && SLUG_RE.test(v) ? v : bad('Invalid slug'));

export const parseSid = (s: string): { uuid: string; fields: string } => {
	try { return decodeSid(s); } catch { return bad('Invalid SID'); }
};

export const encodeSid = (uuid: string, fields: string): string => `${uuid}_${fields}`;

export const parseMonthParam = (s: string): { year: number; month: number } => {
	try { return decodeMonth(s); } catch { return bad('Invalid month param'); }
};

export const parseDayParam = (s: string): { year: number; month: number; day: number } => {
	try { return decodeDay(s); } catch { return bad('Invalid day param'); }
};

export const parseDateRange = (s: string): { from: { year: number; month: number; day: number }; to: { year: number; month: number; day: number } } => {
	try { return decodeDateRange(s); } catch { return bad('Invalid date range param'); }
};

export const parseTimeParam = (s: string): { year: number; month: number; day: number; startH: number; startM: number; endH: number; endM: number } => {
	try { return decodeTime(s); } catch { return bad('Invalid time param'); }
};

export const parseFieldEncoding = (s: string): { required: readonly string[]; optional: readonly string[] } => {
	try { return decodeFieldEncoding(s); } catch { return bad('Invalid field encoding'); }
};

export const encodeSlot = (slot: { startH: number; startM: number; endH: number; endM: number }): string => encodeSlotString(slot);

export const encodeMonthParam = (d: { year: number; month: number }): string => `${d.year}-${p(d.month)}`;

export const FIELD_VALIDATORS: Record<string, (v: unknown) => boolean> = {
	fn: (v) => typeof v === 'string' && v.length >= 1 && v.length <= 100,
	ln: (v) => typeof v === 'string' && v.length >= 1 && v.length <= 100,
	em: (v) => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
	ph: (v) => typeof v === 'string' && v.length >= 7 && v.length <= 30,
	ad: (v) => typeof v === 'string' && v.length >= 5,
	nt: (v) => typeof v === 'string' && v.length <= 1000,
	pm: () => true,
};

// ══════════════════════════════════════════════════════════════════════════════
// BUSINESS
// ══════════════════════════════════════════════════════════════════════════════

export class BusinessInfo extends Schema.Class<BusinessInfo>('BusinessInfo')({
	b_id: Schema.String,
	owner_sub: Schema.String,
	dba: Schema.NullOr(Schema.String),
	slug: Schema.String,
	tz: Schema.String,
}) {}

export const decodeBusinessInfo = Schema.decodeUnknownSync(BusinessInfo);

// ══════════════════════════════════════════════════════════════════════════════
// SESSION SUBMISSION
// ══════════════════════════════════════════════════════════════════════════════

/** Schema for the booking session form submission (fn, ln, em). */
export const SessionBody = Schema.Struct({
	fn: Schema.String.pipe(Schema.trimmed(), Schema.minLength(1)),
	ln: Schema.String.pipe(Schema.trimmed(), Schema.minLength(1)),
	em: Schema.String.pipe(Schema.trimmed(), Schema.minLength(1)),
});

export type SessionBody = typeof SessionBody.Type;

// ══════════════════════════════════════════════════════════════════════════════
// FIELD CODES
// ══════════════════════════════════════════════════════════════════════════════

/** Two-letter field codes used in session ID encoding. */
export const FIELD_CODES = {
	fn: 'First name',
	ln: 'Last name',
	em: 'Email',
	ph: 'Phone',
	ad: 'Address',
	nt: 'Notes',
	pm: 'Payment',
} as const;

export type FieldCode = keyof typeof FIELD_CODES;

/** Payment type codes (subtype of pm). */
export const PAYMENT_CODES = {
	p1: 'Fee-based',
	p2: 'Tip-based',
	p3: 'Full prepayment',
	p4: 'Partial / deposit',
} as const;

export type PaymentCode = keyof typeof PAYMENT_CODES;

/** Check if payment is in the required or optional side of the encoding. */
export function getPaymentPosition(encoding: string): 'required' | 'optional' | 'none' {
	const parsed = Schema.decodeUnknownOption(FieldEncoding)(encoding);
	if (parsed._tag === 'None') return 'none';
	if (parsed.value.required.some((c) => c.startsWith('p'))) return 'required';
	if (parsed.value.optional.some((c) => c.startsWith('p'))) return 'optional';
	return 'none';
}

// ══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════════════════════════════════════════

export const SESSION_TTL = 3 * 60 * 60;

// ══════════════════════════════════════════════════════════════════════════════
// TIME FORMATTING
// ══════════════════════════════════════════════════════════════════════════════

/** Format HHmm → "h:MM AM/PM" for display. */
export function formatHHmm(hhmm: string): string {
	const h = parseInt(hhmm.slice(0, 2), 10);
	const m = hhmm.slice(2, 4);
	const period = h >= 12 ? 'PM' : 'AM';
	const hour = h % 12 || 12;
	return `${hour}:${m} ${period}`;
}

/** Format a slot string HHmmHHmm → "h:MM AM – h:MM PM" for display. */
export function formatSlotDisplay(slot: string): string {
	return `${formatHHmm(slot.slice(0, 4))} – ${formatHHmm(slot.slice(4, 8))}`;
}

/** Parse "HH:MM" → { hour, minute } or null. */
export function parseTime(time: string): { hour: number; minute: number } | null {
	const match = time.match(/^(\d{1,2}):(\d{2})$/);
	if (!match) return null;
	const hourStr = match[1];
	const minuteStr = match[2];
	if (hourStr === undefined || minuteStr === undefined) return null;
	const hour = parseInt(hourStr, 10);
	const minute = parseInt(minuteStr, 10);
	if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
	return { hour, minute };
}

/** Formats "HH:MM" → "h:MM AM/PM" */
export const formatTimeDisplay = (time: string) =>
	DateTime.unsafeMake(`1970-01-01T${time}`).pipe(DateTime.formatUtc({ locale: 'en-US', hour: 'numeric', minute: '2-digit' }));

/** Formats "YYYY-MM-DD" → "Monday, January 1, 2024" */
export const formatBookingDate = (dateStr: string) =>
	DateTime.unsafeMake(dateStr).pipe(
		DateTime.removeTime,
		DateTime.formatUtc({ locale: 'en-US', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
	);

/** Formats "HH:MM" → "h:MM AM/PM ET" */
export const formatBookingTime = (time: string) => `${formatTimeDisplay(time)} ET`;

/** Formats wall-clock components into a full localized date/time string with timezone.
 *  `h`/`m` are WALL-CLOCK time in `tz` (not UTC), so we format them directly rather than
 *  round-tripping through Date.UTC (which would subtract the tz offset and shift the time). */
export const formatBookingDateTime = (year: number, month: number, day: number, h: number, m: number, tz: string) => {
	// Calendar weekday/month names are tz-independent for a given date.
	const date = new Date(year, month - 1, day);
	const weekday = date.toLocaleString('en-US', { weekday: 'long' });
	const monthName = date.toLocaleString('en-US', { month: 'long' });
	const hour12 = h % 12 || 12;
	const ampm = h < 12 ? 'AM' : 'PM';
	const min = String(m).padStart(2, '0');
	// Short tz label (e.g. "EDT") via a sample Date in the target zone.
	const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'short' }).formatToParts(new Date(year, month - 1, day, h, m));
	const tzLabel = parts.find((p) => p.type === 'timeZoneName')?.value ?? '';
	return `${weekday}, ${monthName} ${day}, ${year}, ${hour12}:${min} ${ampm} ${tzLabel}`.trim();
};

/** Format cents to dollars display string. */
export const formatCurrency = (cents: number, decimals: number = 2) => (cents / 100).toFixed(decimals);
