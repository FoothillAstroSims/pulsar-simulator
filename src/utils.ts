import * as THREE from "three";

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

// Formula to calculate the direction of the pulsar beam given the phase, axis inclination, and latitude
export function getPulsarBeamDirection(
	pulsarPhase: number,
	pulsarAxisInclination: [number, number, number],
	pulsarBeamLatitude: number,
	pulsarBeamDirectionXZInitial: [number, number] = [1, 0],
): [number, number, number] {
	const [x, z] = pulsarBeamDirectionXZInitial;

	return new THREE.Vector3(
		(x * Math.cos(pulsarPhase) + z * Math.sin(pulsarPhase)) *
			Math.cos(pulsarBeamLatitude),
		-Math.sin(pulsarBeamLatitude),
		(-x * Math.sin(pulsarPhase) + z * Math.cos(pulsarPhase)) *
			Math.cos(pulsarBeamLatitude),
	)
		.applyEuler(new THREE.Euler(...pulsarAxisInclination))
		.toArray();
}

// Formula for pulsar beam intensity given the beam direction, camera/detector direction, and the beam angle
export function getPulsarBeamIntensity(
	pulsarBeamDirection: [number, number, number],
	cameraDirection: [number, number, number],
	pulsarBeamAngle: number,
): number {
	const dotProd = new THREE.Vector3(...pulsarBeamDirection)
		.normalize()
		.dot(new THREE.Vector3(...cameraDirection).normalize());
	const pulsarCameraAngle = Math.acos(dotProd < 0 ? -dotProd : dotProd);

	return pulsarCameraAngle < pulsarBeamAngle
		? Math.cos(((Math.PI / 2) * pulsarCameraAngle) / pulsarBeamAngle) ** 2
		: 0;
}

// Get mesh direction - mainly used to get the pulsar beam direction
export function getMeshDirection(
	mesh: THREE.Mesh,
	directionInit: [number, number, number],
): [number, number, number] {
	const direction = new THREE.Vector3(...directionInit);
	const quaternionRotation = new THREE.Quaternion();

	mesh.getWorldQuaternion(quaternionRotation);
	return direction.applyQuaternion(quaternionRotation).toArray();
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
