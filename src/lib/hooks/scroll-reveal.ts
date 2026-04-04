import type { Attachment } from 'svelte/attachments';

export const scrollReveal: Attachment<HTMLElement> = (node) => {
	const observer = new IntersectionObserver(
		([entry]) => {
			if (entry.isIntersecting) {
				node.classList.add('revealed');
				observer.disconnect();
			}
		},
		{ threshold: 0, rootMargin: '0px 0px -20% 0px' },
	);
	observer.observe(node);
	return () => observer.disconnect();
};
