import Plotly from "plotly.js-dist-min";
import factoryImport from "react-plotly.js/factory";

const createPlotlyComponent =
	(factoryImport as unknown as { default?: typeof factoryImport }).default ??
	factoryImport;
const Plot = createPlotlyComponent(Plotly);

import type * as THREE from "three";
import type { PulsarModelProps } from "./PulsarModel";
import { range } from "./utils";

const omega = Math.PI / 24;
const cameraAngle = Math.PI / 2;
const xAxis = range(0, 100 * Math.PI, 0.001);
const yAxis = xAxis.map((x) => {
	return Math.abs(cameraAngle - (x % Math.PI)) <= omega
		? Math.cos(((Math.PI / 2) * (cameraAngle - x)) / omega) ** 2
		: 0;
});

export function PulsarPlotTime(
	props: PulsarModelProps & {
		cameraDirection: THREE.Vector3;
	},
) {
	return;
}

export function PulsarPlotPhase() {}
