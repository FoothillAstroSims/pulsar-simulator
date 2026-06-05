import * as THREE from "three";

// Generate a range of values
export function range(start: number, stop: number, step: number): number[] {
	const len = Math.floor((stop - start) / step);
	return Array.from({ length: len }, (_, i) => start + i * step);
}

export interface PulsarBeamDirectionParams {
	pulsarPhase: number;
	pulsarAxialTilt: number;
	pulsarBeamLatitude: number;
}

// Formula to calculate the direction of the pulsar beam given the phase, axial tilt, and latitude
export function pulsarBeamDirection(
	pulsarPhase: PulsarBeamDirectionParams["pulsarPhase"],
	pulsarAxialTilt: PulsarBeamDirectionParams["pulsarAxialTilt"],
	pulsarBeamLatitude: PulsarBeamDirectionParams["pulsarBeamLatitude"],
): THREE.Vector3 {
	return new THREE.Vector3(
		-Math.cos(pulsarBeamLatitude) *
			Math.cos(pulsarPhase) *
			Math.cos(pulsarAxialTilt) -
			Math.sin(pulsarBeamLatitude) * Math.sin(pulsarAxialTilt),
		-Math.cos(pulsarBeamLatitude) *
			Math.cos(pulsarPhase) *
			Math.sin(pulsarAxialTilt) +
			Math.sin(pulsarBeamLatitude) * Math.cos(pulsarAxialTilt),
		Math.cos(pulsarBeamLatitude) * Math.sin(pulsarPhase),
	);
}

// Formula for pulsar beam intensity given the beam direction, camera/detector direction, and the beam angle
export function pulsarBeamIntensity(
	pulsarBeamDirection: THREE.Vector3,
	cameraDirection: THREE.Vector3,
	pulsarBeamAngle: number,
): number {
	const pulsarCameraAngle = Math.acos(
		pulsarBeamDirection.normalize().dot(cameraDirection.normalize()),
	);

	return pulsarCameraAngle <= pulsarBeamAngle ||
		Math.PI - pulsarCameraAngle <= pulsarBeamAngle
		? Math.cos(((Math.PI / 2) * pulsarCameraAngle) / pulsarBeamAngle) ** 2
		: 0;
}
