import { onNavigate } from '$app/navigation';
import type { OnNavigate } from '@sveltejs/kit';

export type ViewTransitionDirection = 'forward' | 'back';

export type UseViewTransitionOptions = {
	direction?: (navigation: OnNavigate) => ViewTransitionDirection | null | undefined;
};

export function useViewTransition({ direction }: UseViewTransitionOptions = {}) {
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		if (direction) {
			const d = direction(navigation);
			if (d) document.documentElement.dataset.nav = d;
			else delete document.documentElement.dataset.nav;
		}

		return new Promise<void>((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
}
