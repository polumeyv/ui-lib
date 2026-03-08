import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs));
}

// ─── Money ─────────────────────────────────────────────────────────────────────

export class Money {
	constructor(public readonly cents: number = 0) {}

	format(currency: Intl.NumberFormatOptions['currency'] = 'USD'): string {
		return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(this.cents / 100);
	}
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const uuidv7ToDate = (uuid: string) => new Date(parseInt(uuid.replace(/-/g, '').slice(0, 12), 16));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };
