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
