import * as THREE from "three";
import { range } from "../utils";

export type Triplet = [number, number, number];

export function rescale(x: number, scale: number = 1, offset: number = 0) {
	return x / scale + offset;
}
export function unrescale(x: number, scale: number = 1, offset: number = 0) {
	return scale * (x - offset);
}

// Default values, ranges, and step sizes for each parameter
export const pulsarPhaseXScale = parseFloat((2 * Math.PI).toFixed(3)) / 360.0;
export const pulsarPhaseXOffset = -180;
export function pulsarPhaseXRescale(x: number) {
	return rescale(x, pulsarPhaseXScale, pulsarPhaseXOffset);
}
export function pulsarPhaseXUnrescale(x: number) {
	return unrescale(x, pulsarPhaseXScale, pulsarPhaseXOffset);
}

export const pulsarPhaseDefault = 0.0;
export const pulsarPhaseMin = 0.0;
export const pulsarPhaseMax = parseFloat((2 * Math.PI).toFixed(3));
export const pulsarPhaseStep = 0.001;
export const [pulsarPhaseMinRescaled, pulsarPhaseMaxRescaled] = [
	pulsarPhaseMin,
	pulsarPhaseMax,
].map(pulsarPhaseXRescale);
export const pulsarPhaseX = range(
	pulsarPhaseMin,
	pulsarPhaseMax,
	pulsarPhaseStep,
).map(pulsarPhaseXRescale);

export const pulsarPeriodDefault = 4.0;
export const pulsarPeriodMin = 1.0;
export const pulsarPeriodMax = 10.0;
export const pulsarPeriodStep = 0.01;

export const pulsarAxisEulerDefault: Triplet = [0.0, 0.0, 0.0];
export const pulsarAxisEulerMin: Triplet = [-Math.PI, -Math.PI, -Math.PI].map(
	(angle) => parseFloat(angle.toFixed(3)),
) as Triplet;
export const pulsarAxisEulerMax: Triplet = [Math.PI, Math.PI, Math.PI].map(
	(angle) => parseFloat(angle.toFixed(3)),
) as Triplet;
export const pulsarAxisEulerStep: Triplet = [0.001, 0.001, 0.001];

export const pulsarBeamLatitudeDefault = 0.0;
export const pulsarBeamLatitudeMin = 0.0;
export const pulsarBeamLatitudeMax = parseFloat((Math.PI / 2).toFixed(3));
export const pulsarBeamLatitudeStep = 0.001;

export const pulsarBeamAngleDefault = parseFloat((Math.PI / 24).toFixed(3));
export const pulsarBeamAngleMin = 0.0;
export const pulsarBeamAngleMax = parseFloat((Math.PI / 8).toFixed(3));
export const pulsarBeamAngleStep = 0.001;

export const isAnimatingDefault = true;
export const orbitControlsEnabledDefault = false;

// Pulsar model constants - geometry, colors, other visual display parameters
export const pulsarBodyRadius = 5;
export const pulsarBodyWidthSeg = 64;
export const pulsarBodyHeightSeg = 32;
export const pulsarBodyColor = "#3f70bf";

export const pulsarBeamHeight = 20;
export const pulsarBeamRadSeg = 32;
export const pulsarBeamHeightSeg = 4;
export const pulsarBeamColor = "#ffffff";
export const pulsarBeamTransparency = 0.5;
export const pulsarBeamsRotationInitial = Math.PI;

export const pulsarAxisColor = "#ffffff";
export const pulsarAxisLineWidth = 2;

export const pulsarEquatorColor = "#ffffff";
export const pulsarEquatorLineWidth = 2;

export const cameraPositionDefault: Triplet = [
	1.5 * pulsarBeamHeight,
	0.0,
	0.0,
];

export const lightDirectionDefault: Triplet = [
	pulsarBodyRadius * 2,
	pulsarBodyRadius * 2,
	-pulsarBodyRadius * 2,
];

// Create geometry for a pulsar beam
export function createPulsarBeamGeometry(radius: number): THREE.ConeGeometry {
	return new THREE.ConeGeometry(
		radius,
		pulsarBeamHeight,
		pulsarBeamRadSeg,
		pulsarBeamHeightSeg,
		true,
	).translate(0, -pulsarBeamHeight / 2 - pulsarBodyRadius, 0);
}

// Set rotation for two pulsar beams
export function setPulsarBeamsRotation(
	beam1: THREE.Mesh,
	beam2: THREE.Mesh,
	latitude: number,
): void {
	beam1.rotation.set(0, pulsarBeamsRotationInitial, Math.PI / 2 + latitude);
	beam2.rotation.set(0, pulsarBeamsRotationInitial, latitude - Math.PI / 2);
}

// Formula to calculate the direction of the pulsar beam given the initial direction, phase, axis inclination, and latitude
export function getPulsarBeamDirection(
	pulsarPhase: number,
	pulsarAxisEuler: Triplet,
	pulsarBeamLatitude: number,
	pulsarBeamDirectionXZInitial: [number, number] = [
		-Math.cos(pulsarBeamsRotationInitial),
		Math.sin(pulsarBeamsRotationInitial),
	],
): Triplet {
	const [x, z] = pulsarBeamDirectionXZInitial;

	return new THREE.Vector3(
		(x * Math.cos(pulsarPhase) + z * Math.sin(pulsarPhase)) *
			Math.cos(pulsarBeamLatitude),
		-Math.sin(pulsarBeamLatitude),
		(-x * Math.sin(pulsarPhase) + z * Math.cos(pulsarPhase)) *
			Math.cos(pulsarBeamLatitude),
	)
		.applyEuler(new THREE.Euler(...pulsarAxisEuler))
		.toArray();
}

// Formula for pulsar beam intensity given the beam direction, camera/detector direction, and the beam angle
export function getPulsarBeamIntensity(
	pulsarBeamDirection: Triplet,
	cameraDirection: Triplet,
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
	directionInit: Triplet,
): Triplet {
	const direction = new THREE.Vector3(...directionInit);
	const quaternionRotation = new THREE.Quaternion();

	mesh.getWorldQuaternion(quaternionRotation);
	return direction.applyQuaternion(quaternionRotation).toArray();
}
