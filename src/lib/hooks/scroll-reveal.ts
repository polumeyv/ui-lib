import type { Attachment } from 'svelte/attachments';

export const scrollReveal: Attachment<HTMLElement> = (node) => {
	node.style.opacity = '0';
	node.style.transform = 'translateY(24px)';
	node.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';

	const observer = new IntersectionObserver(
		([entry]) => {
			if (entry.isIntersecting) {
				node.style.opacity = '1';
				node.style.transform = 'translateY(0)';
				observer.disconnect();
			}
		},
		{ threshold: 0, rootMargin: '0px 0px -20% 0px' },
	);
	observer.observe(node);
	return () => observer.disconnect();
};
