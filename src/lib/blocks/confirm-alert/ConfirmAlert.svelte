<script lang="ts">
    import { AlertDialog, Button } from '../../components/index.ts';

    interface Props {
        open: boolean;
        title: string;
        description: string;
        onclose: () => void;
        buttonLabel?: string;
    }

    let { open, title, description, onclose, buttonLabel = 'OK' }: Props = $props();
</script>

<AlertDialog.Root {open}>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>{title}</AlertDialog.Title>
            <AlertDialog.Description>{description}</AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
            <Button onclick={onclose}>{buttonLabel}</Button>
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>
