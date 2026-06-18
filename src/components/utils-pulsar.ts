import * as THREE from "three";
import { range } from "../utils";

export type Triplet = [number, number, number];

export function rescale(x: number, scale: number = 1, offset: number = 0) {
	return x / scale + offset;
}
export function unrescale(x: number, scale: number = 1, offset: number = 0) {
	return scale * (x - offset);
}

export const DISPLAY_FRAME_RATE = 60.0; // Display frame rate, in Hz
const DEG_TO_RAG_SCALE = 180 / Math.PI; // Degrees to radians conversion rate

// Default values, ranges, and step sizes for each parameter
export const PULSAR_PHASE_DEG_DEFAULT = 0.0;
export const PULSAR_PHASE_DEG_MIN = -180;
export const PULSAR_PHASE_DEF_MAX = 180;
export const PULSAR_PHASE_DEG_STEP = 0.1;
export const PULSAR_PHASE_DEG_XAXIS = range(
	PULSAR_PHASE_DEG_MIN,
	PULSAR_PHASE_DEF_MAX,
	PULSAR_PHASE_DEG_STEP,
);
export const PULSAR_PHASE_OFFSET = Math.PI;
export const pulsarPhaseDegToRad = (x: number) =>
	rescale(x, DEG_TO_RAG_SCALE, PULSAR_PHASE_OFFSET);
export const pulsarPhaseRadToDeg = (x: number) =>
	unrescale(x, DEG_TO_RAG_SCALE, PULSAR_PHASE_OFFSET);

export const PULSAR_PERIOD_DEFAULT = 4;
export const PULSAR_PERIOD_MIN = 1;
export const PULSAR_PERIOD_MAX = 10;
export const PULSAR_PERIOD_STEP = 0.01;

export const PULSAR_AXIS_EULER_DEG_DEFAULT: Triplet = [0, 0, 0];
export const PULSAR_AXIS_EULER_DEG_MIN: Triplet = [-180, -180, -180];
export const PULSAR_AXIS_EULER_DEG_MAX: Triplet = [180, 180, 180];
export const PULSAR_AXIS_EULER_DEG_STEP = 0.1;
export const pulsarAxisEulerDegToRad = (euler: Triplet) =>
	euler.map((x) => rescale(x, DEG_TO_RAG_SCALE)) as Triplet;

export const PULSAR_BEAM_LATITUDE_DEG_DEFAULT = 0;
export const PULSAR_BEAM_LATITUDE_DEG_MIN = 0;
export const PULSAR_BEAM_LATITUDE_DEG_MAX = 90;
export const PULSAR_BEAM_LATITUDE_DEG_STEP = 0.1;
export const pulsarBeamLatitudeDegToRad = (lat: number) =>
	rescale(lat, DEG_TO_RAG_SCALE);

export const IS_ANIMATING_DEFAULT = true;
export const ORBIT_CONTROLS_ENABLED_DEFAULT = false;

// Pulsar model constants - geometry, colors, other visual display parameters
export const PULSAR_BODY_RADIUS = 5;
export const PULSAR_BODY_WIDTH_SEG = 64;
export const PULSAR_BODY_HEIGHT_SEG = 32;
export const PULSAR_BODY_COLOR = "#3f70bf";

export const PULSAR_BEAM_HEIGHT = 20;
export const PULSAR_BEAM_RADIUS_SEG = 32;
export const PULSAR_BEAM_HEIGHT_SEG = 4;
export const PULSAR_BEAM_COLOR = "#ffffff";
export const PULSAR_BEAM_TRANS = 0.5;
export const PULSAR_BEAM_ROTATION_RAD_INIT = Math.PI;

export const PULSAR_AXIS_COLOR = "#ffffff";
export const PULSAR_AXIS_LINE_WIDTH = 2;

export const PULSAR_EQUATOR_COLOR = "#ffffff";
export const PULSAR_EQUATOR_LINE_WIDTH = 2;

export const CAMERA_POSITION_DEF: Triplet = [
	1.5 * PULSAR_BEAM_HEIGHT,
	0.0,
	0.0,
];

export const LIGHT_DIRECTION_DEF: Triplet = [
	PULSAR_BODY_RADIUS * 2,
	PULSAR_BODY_RADIUS * 2,
	-PULSAR_BODY_RADIUS * 2,
];

// Pulsar beam radius – defined here because the max radius depends on the height
export const PULSAR_BEAM_RADIUS_DEFAULT = 2;
export const PULSAR_BEAM_RADIUS_MIN = 0;
export const PULSAR_BEAM_RADIUS_MAX = PULSAR_BEAM_HEIGHT;
export const PULSAR_BEAM_RADIUS_STEP = 0.1;

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
