import { range } from "./pulsar-utils";

export type Triplet = [number, number, number];

export function rescale(x: number, scale: number = 1, offset: number = 0) {
	return x / scale + offset;
}
export function unrescale(x: number, scale: number = 1, offset: number = 0) {
	return scale * (x - offset);
}

export const DISPLAY_FRAME_RATE = 60.0; // Display frame rate, in Hz
const DEG_TO_RAG_SCALE = 180 / Math.PI;

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

export const CAMERA_POSITION_DEFAULT: Triplet = [
	1.5 * PULSAR_BEAM_HEIGHT,
	0.0,
	0.0,
];

export const LIGHT_DIRECTION_DEFAULT: Triplet = [
	PULSAR_BODY_RADIUS * 2,
	PULSAR_BODY_RADIUS * 2,
	-PULSAR_BODY_RADIUS * 2,
];

// Pulsar beam radius – defined here because the max radius depends on the height
export const PULSAR_BEAM_RADIUS_DEFAULT = 2;
export const PULSAR_BEAM_RADIUS_MIN = 0;
export const PULSAR_BEAM_RADIUS_MAX = PULSAR_BEAM_HEIGHT;
export const PULSAR_BEAM_RADIUS_STEP = 0.1;
