/** Copy text to the clipboard with a temporary copied state. */
export class UseClipboard {
    #copiedStatus = $state<"success" | "failure">();
    delay: number;
    reset: boolean;
    timeout: ReturnType<typeof setTimeout> | undefined = undefined;
    #lastCopied = $state<string | undefined>(undefined);

    constructor({
        delay = 2000,
        reset = true,
    }: {
        /** Time in ms before the copied status resets. */
        delay?: number;
        /** Whether to auto-reset the status after the delay. */
        reset?: boolean;
    } = {}) {
        this.delay = delay;
        this.reset = reset;
    }

    /** Copies the given text to the user's clipboard. */
    copy(text: string | number): void {
        this.timeout && (clearTimeout(this.timeout), (this.#copiedStatus = undefined));

        navigator.clipboard.writeText(text.toString()).then(
            () => ((this.#copiedStatus = "success"), (this.#lastCopied = text.toString())),
            () => (this.#copiedStatus = "failure")
        ).then(
            () => (this.timeout = setTimeout(() => (this.#copiedStatus = undefined), this.delay)),
            () => (this.#copiedStatus = "failure")
        );
    }

    /** Whether the last copy was successful. */
    get copied(): boolean {
        return this.#copiedStatus === "success";
    }

    /** The result of the last copy — `"success"`, `"failure"`, or `undefined` if idle. */
    get status(): "success" | "failure" | undefined {
        return this.#copiedStatus;
    }

    /** The last successfully copied text. */
    get lastCopied(): string | undefined {
        return this.#lastCopied;
    }
}