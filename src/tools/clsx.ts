/**
 * Joins CSS classes
 */
export const clsx: any = function () {
  const args: string[] = Array.prototype.slice.call(arguments);
  return args.join(' ');
};
