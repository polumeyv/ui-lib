import { dinero, toDecimal } from 'dinero.js';
import { USD } from 'dinero.js/currencies';

export const formatUSD = (cents: number): string =>
	toDecimal(dinero({ amount: cents, currency: USD }), ({ value }) =>
		new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value)));
