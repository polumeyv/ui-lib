import { PinInput } from 'bits-ui';
import Root from './input-otp.svelte';
import Group from './input-otp-group.svelte';
import Separator from './input-otp-separator.svelte';
import Slot from './input-otp-slot.svelte';

export type Cell = PinInput.CellProps['cell'];
export type RootSnippetProps = { cells: Cell[]; isFocused: boolean; isHovering: boolean };

export {
	Root,
	Group,
	Slot,
	Separator,
	Root as InputOTP,
	Group as InputOTPGroup,
	Slot as InputOTPSlot,
	Separator as InputOTPSeparator,
};
