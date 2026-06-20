export const DISPLAY_FRAME_RATE = 60.0; // Display frame rate, in Hz

// Get the number of decimal places in a number
export function getDecimalPlaces(num: number) {
	return Math.floor(num) === num ? 0 : num.toString().split(".")[1].length || 0;
}

// Generate a range of values
export function range(start: number, stop: number, step: number): number[] {
	const len = Math.floor((stop - start) / step);
	return Array.from({ length: len }, (_, i) => start + i * step);
}

// Create an event handler that runs a callback whenever certain individual keys are pressed
export function createKeyDownEventHandler(
	keys: string[],
	callbackFn: () => void,
): (e: KeyboardEvent) => void {
	return (e) => {
		const target = e.target;
		if (
			target &&
			target instanceof HTMLInputElement &&
			(target.type === "text" ||
				target.type === "textarea" ||
				target.type === "number")
		)
			return;

		if (keys.includes(e.key)) callbackFn();
	};
}
