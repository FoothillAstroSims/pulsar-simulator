import * as THREE from "three";

// Generate a range of values
export function range(start: number, stop: number, step: number): number[] {
	const len = Math.floor((stop - start) / step);
	return Array.from({ length: len }, (_, i) => start + i * step);
}

// Formula to calculate the direction of the pulsar beam given the phase, axial tilt, and latitude
export function pulsarBeamDirection(
	pulsarPhase: number,
	pulsarAxialTilt: number,
	pulsarBeamLatitude: number,
): THREE.Vector3 {
	return new THREE.Vector3(
		Math.cos(pulsarBeamLatitude) * Math.sin(pulsarPhase),
		-Math.cos(pulsarBeamLatitude) *
			Math.cos(pulsarPhase) *
			Math.sin(pulsarAxialTilt) +
			Math.sin(pulsarBeamLatitude) * Math.cos(pulsarAxialTilt),
		Math.cos(pulsarBeamLatitude) *
			Math.cos(pulsarPhase) *
			Math.cos(pulsarAxialTilt) +
			Math.sin(pulsarBeamLatitude) * Math.sin(pulsarAxialTilt),
	);
}
