/**
 * @polumeyv/ui - Svelte component library
 * Re-exports all shadcn-svelte components, utilities, and hooks
 */

// Re-export all components
export * from './components/index.ts';

// Re-export blocks (higher-level composite components)
export * from './blocks/index.ts';

// Re-export utilities
export { cn, Money, uuidv7ToDate } from './utils.ts';
export type { WithoutChild, WithoutChildrenOrChild, WithoutChildren, WithElementRef } from './utils.ts';

// Re-export hooks
export { IsMobile, isMobile } from './hooks/index.ts';
