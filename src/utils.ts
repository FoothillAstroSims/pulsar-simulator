/**
 * Create an event handler that runs a callback whenever certain individual keys are pressed
 * @param keys Key presses to watch for
 * @param callbackFn Callback function to run upon key press
 * @returns Event handler to run the callback function upon key press
 */
export function createKeyDownEventHandler(
	keys: string[],
	callbackFn: () => void,
): (e: KeyboardEvent) => void {
	return (e) => {
		const target = e.target;
		if (target) {
			if (
				target instanceof HTMLInputElement &&
				(target.type === "text" ||
					target.type === "textarea" ||
					target.type === "number")
			)
				return; // Ignore key press event if the user is typing in an input box of some sort

			if (keys.includes(e.key)) callbackFn();
		}
	};
}


/**
 * Generate a range of numerical values, similar to Python's `range` builtin
 * @param start Start value
 * @param stop End value
 * @param step Step size
 * @returns Range of values between the start and end, inclusive
 */
export function range(start: number, stop: number, step: number): number[] {
	const len = Math.floor((stop - start) / step);
	return Array.from({ length: len }, (_, i) => start + i * step);
}
