import { writable } from 'svelte/store';
import type { PageData } from './$types';

export const lekhAH = writable<PageData['lekh']>(null!);
export const mode = writable<'main' | 'new_user' | 'reset'>('main');
export const id = writable<string>('');
export const pass = writable<string>('');
