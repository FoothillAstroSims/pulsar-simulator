export function linspace(start: number, stop: number, step: number) {
	const len = Math.floor((stop - start) / step);
	return Array.from({ length: len }, (_, i) => start + i * step);
}
