<script lang="ts">
import { AlertDialog as AlertDialogPrimitive } from 'bits-ui';
import { buttonVariants } from '../button/index.ts';
import { cn } from '../../utils.ts';

let { ref = $bindable(null), class: className, ...restProps }: AlertDialogPrimitive.ActionProps = $props();
</script>

<AlertDialogPrimitive.Action
	bind:ref
	data-slot="alert-dialog-action"
	class={cn(buttonVariants(), className)}
	{...restProps}
/>
