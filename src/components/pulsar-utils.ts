/* 
Utility functions for use in the pulsar simulation
*/

import * as THREE from "three";
import {
	PULSAR_BEAM_HEIGHT,
	PULSAR_BEAM_RADIUS_SEG,
	PULSAR_BEAM_HEIGHT_SEG,
	PULSAR_BODY_RADIUS,
	PULSAR_BEAM_ROTATION_RAD_INIT,
	type Triplet,
} from "./pulsar-config";

// Create geometry for a pulsar beam
export function createPulsarBeamGeometry(radius: number): THREE.ConeGeometry {
	return new THREE.ConeGeometry(
		radius,
		PULSAR_BEAM_HEIGHT,
		PULSAR_BEAM_RADIUS_SEG,
		PULSAR_BEAM_HEIGHT_SEG,
		true,
	).translate(0, -PULSAR_BEAM_HEIGHT / 2 - PULSAR_BODY_RADIUS, 0);
}

// Set rotation for two pulsar beams
export function setPulsarBeamsRotation(
	beam1: THREE.Mesh,
	beam2: THREE.Mesh,
	latitudeRad: number,
): void {
	beam1.rotation.set(
		0,
		PULSAR_BEAM_ROTATION_RAD_INIT,
		Math.PI / 2 + latitudeRad,
	);
	beam2.rotation.set(
		0,
		PULSAR_BEAM_ROTATION_RAD_INIT,
		latitudeRad - Math.PI / 2,
	);
}

// Formula to calculate the direction of the pulsar beam given the initial direction, phase, axis inclination, and latitude
export function getPulsarBeamDirection(
	pulsarPhaseRad: number,
	pulsarAxisEulerRad: Triplet,
	pulsarBeamLatitudeRad: number,
	pulsarBeamDirectionXZInitial: [number, number] = [
		-Math.cos(PULSAR_BEAM_ROTATION_RAD_INIT),
		Math.sin(PULSAR_BEAM_ROTATION_RAD_INIT),
	],
): Triplet {
	const [x, z] = pulsarBeamDirectionXZInitial;

	return new THREE.Vector3(
		(x * Math.cos(pulsarPhaseRad) + z * Math.sin(pulsarPhaseRad)) *
			Math.cos(pulsarBeamLatitudeRad),
		-Math.sin(pulsarBeamLatitudeRad),
		(-x * Math.sin(pulsarPhaseRad) + z * Math.cos(pulsarPhaseRad)) *
			Math.cos(pulsarBeamLatitudeRad),
	)
		.applyEuler(new THREE.Euler(...pulsarAxisEulerRad))
		.toArray();
}

// Formula for pulsar beam intensity given the beam direction, camera/detector direction, and the beam angle
export function getPulsarBeamIntensity(
	pulsarBeamDirection: Triplet,
	cameraDirection: Triplet,
	pulsarBeamAngleRad: number,
): number {
	const dotProd = new THREE.Vector3(...pulsarBeamDirection)
		.normalize()
		.dot(new THREE.Vector3(...cameraDirection).normalize());
	const pulsarCameraAngle = Math.acos(dotProd < 0 ? -dotProd : dotProd);

	return pulsarCameraAngle < pulsarBeamAngleRad
		? Math.cos(((Math.PI / 2) * pulsarCameraAngle) / pulsarBeamAngleRad) ** 2
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
