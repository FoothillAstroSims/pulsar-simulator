import Plotly from "plotly.js-dist-min";
import factoryImport from "react-plotly.js/factory";

const createPlotlyComponent =
	(factoryImport as unknown as { default?: typeof factoryImport }).default ??
	factoryImport;
const Plot = createPlotlyComponent(Plotly);

import { useState } from "react";
import type { PulsarBeamIntensityParams } from "../utils";
import { range } from "../utils";

type PulsarPlotParams = PulsarBeamIntensityParams & {
	pulsarPhase: number;
	onPulsarPhaseChange?: (phase: number) => void;
	isAnimating: boolean;
};

export const pulsarPhaseDelta = 0.001
const x = range(0, 2 * Math.PI, pulsarPhaseDelta);

export function PulsarPlotPhase(props: PulsarBeamIntensityParams & {
	pulsarPhase: number;
	onPulsarPhaseChange: (phase: number) => void;
	isAnimating: boolean;
}) {
}

export function PulsarPlotTime(props: PulsarPlotParams) {
	return;
}

