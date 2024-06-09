import { twMerge } from 'tailwind-merge';

/**
 * Joins CSS classes. Also safely work with tailwind classes
 */
export const clsx = (...args: string[]) => {
  return twMerge(args.join(' '));
};
