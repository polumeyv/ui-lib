import { error } from '@sveltejs/kit';
import { Schema } from 'effect';

// ═══ STATUS ════════════════════════════════════════════════════════════════

export const BOOKING_STATUS = Schema.Literal('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
export type BookingStatus = typeof BOOKING_STATUS.Type;

// ═══ RESPONSE TYPES (raw Postgres shapes) ══════════════════════════════════

export interface BookingListItem {
	id: string;
	status: BookingStatus;
	start_time: string;
	end_time: string;
	customer_email: string | null;
	customer_phone: string | null;
	amount: number | null;
	notes: string | null;
	sub: string | null;
	dur: number | null;
	service_name: string | null;
	customer_name: string;
}

export interface Booking {
	id: string;
	client_id: string | null;
	client_name: string;
	email: string;
	phone: string;
	service_name: string | null;
	appointment_time: Date;
	dur: number;
	amount: number;
	status: BookingStatus;
	notes: string | null;
}

// ═══ SETTINGS ══════════════════════════════════════════════════════════════

export const BookingSettings = Schema.Struct({
	allow_online: Schema.Boolean,
	require_deposit: Schema.Boolean,
	auto_confirm: Schema.Boolean,
	require_payment: Schema.Boolean,
	allow_walkins: Schema.Boolean,
	send_reminders: Schema.Boolean,
	allow_cancel: Schema.Boolean,
	allow_reschedule: Schema.Boolean,
	deposit_amount: Schema.Number,
	deposit_is_fixed: Schema.Boolean,
	cancellation_deadline_hours: Schema.Number,
	max_advance_days: Schema.Number,
	min_advance_hours: Schema.Number,
	buf: Schema.Number,
	reminder_hours: Schema.Number,
	cancellation_policy: Schema.optional(Schema.String),
});
export type BookingSettings = typeof BookingSettings.Type;

export const UpdateBookingSettingsS = Schema.partial(BookingSettings);
export type UpdateBookingSettings = typeof UpdateBookingSettingsS.Type;

// ═══ API CLIENT ════════════════════════════════════════════════════════════

export interface BookingRoutes {
	'GET /bookings': BookingListItem[];
	'GET /bookings/:id': Booking;
	'POST /bookings': { id: string; start_time: string; end_time: string };
	'PATCH /bookings/:id': { ok: true };
	'GET /settings': BookingSettings;
	'PATCH /settings': { ok: true };
}

type ResolveRoute<M extends string, P extends string> = {
	[K in keyof BookingRoutes]: K extends `${M} ${infer Pattern}`
		? Pattern extends P
			? BookingRoutes[K]
			: Pattern extends `${infer Prefix}/:${string}`
				? P extends `${Prefix}/${string}`
					? BookingRoutes[K]
					: never
				: never
		: never;
}[keyof BookingRoutes];

export function makeBookingApi(opts: { baseUrl: string; getIdentityPath: () => string }) {
	return async function bookingApi<
		P extends string,
		M extends 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
		R = ResolveRoute<M, P extends `${infer Path}?${string}` ? Path : P>,
	>(path: P, fetchOpts?: { method?: M; body?: unknown }): Promise<R> {
		const identityPath = opts.getIdentityPath();

		const res = await fetch(`${opts.baseUrl}${identityPath}${path}`, {
			method: fetchOpts?.method ?? (fetchOpts?.body ? 'POST' : 'GET'),
			headers: { 'Content-Type': 'application/json' },
			...(fetchOpts?.body ? { body: JSON.stringify(fetchOpts.body) } : {}),
		});

		if (!res.ok) {
			const body = (await res.json().catch(() => ({}))) as { error?: string };
			throw error(res.status, body.error ?? `API error (${res.status})`);
		}

		return res.json() as Promise<R>;
	};
}
