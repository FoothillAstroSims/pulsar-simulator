import * as THREE from "three";

// Generate a range of values
export function range(start: number, stop: number, step: number): number[] {
	const len = Math.floor((stop - start) / step);
	return Array.from({ length: len }, (_, i) => start + i * step);
}

export interface PulsarBeamDirectionParams {
	pulsarPhase: number;
	pulsarAxisInclination: [number, number, number];
	pulsarBeamLatitude: number;
}

// Formula to calculate the direction of the pulsar beam given the phase, axis inclination, and latitude
export function pulsarBeamDirection(
	pulsarPhase: PulsarBeamDirectionParams["pulsarPhase"],
	pulsarAxisInclination: PulsarBeamDirectionParams["pulsarAxisInclination"],
	pulsarBeamLatitude: PulsarBeamDirectionParams["pulsarBeamLatitude"],
	pulsarBeamDirectionXZInitial: [number, number] = [-1, 0],
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

export interface PulsarBeamIntensityParams {
	pulsarBeamDirection: [number, number, number];
	cameraDirection: [number, number, number];
	pulsarBeamAngle: number;
}

// Formula for pulsar beam intensity given the beam direction, camera/detector direction, and the beam angle
export function pulsarBeamIntensity(
	pulsarBeamDirection: PulsarBeamIntensityParams["pulsarBeamDirection"],
	cameraDirection: PulsarBeamIntensityParams["cameraDirection"],
	pulsarBeamAngle: PulsarBeamIntensityParams["pulsarBeamAngle"],
): number {
	const pulsarCameraAngle = Math.acos(
		new THREE.Vector3(...pulsarBeamDirection)
			.normalize()
			.dot(new THREE.Vector3(...cameraDirection).normalize()),
	);

	return pulsarCameraAngle <= pulsarBeamAngle ||
		Math.PI - pulsarCameraAngle <= pulsarBeamAngle
		? Math.cos(((Math.PI / 2) * pulsarCameraAngle) / pulsarBeamAngle) ** 2
		: 0;
}
