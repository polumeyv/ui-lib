<script lang="ts">
import { PinInput as InputOTPPrimitive } from 'bits-ui';
import { cn } from '../../utils';

let {
	ref = $bindable(null),
	class: className,
	value = $bindable<string | number>(''),
	onValueChange,
	...restProps
}: Omit<InputOTPPrimitive.RootProps, 'value'> & { value?: string | number } = $props();
</script>

<InputOTPPrimitive.Root
	bind:ref
	value={String(value)}
	onValueChange={(v) => ((value = v), onValueChange?.(v))}
	data-slot="input-otp"
	class={cn(
		"flex items-center gap-2 has-disabled:opacity-50 [&_input]:disabled:cursor-not-allowed",
		className
	)}
	{...restProps}
/>
