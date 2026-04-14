export const formatPhone = (phone: string): string =>
	phone?.startsWith('+1') && phone.length === 12 ? `+1 (${phone.slice(2, 5)}) ${phone.slice(5, 8)}-${phone.slice(8)}` : phone;
