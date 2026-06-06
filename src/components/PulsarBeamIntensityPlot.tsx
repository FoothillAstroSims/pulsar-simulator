import Plotly from "plotly.js-dist-min";
import factoryImport from "react-plotly.js/factory";

const createPlotlyComponent =
	(factoryImport as unknown as { default?: typeof factoryImport }).default ??
	factoryImport;
const Plot = createPlotlyComponent(Plotly);

import { pulsarBeamDirection, pulsarBeamIntensity, range } from "../utils";

export const pulsarPhaseStep = 0.001;
const x = range(0, 2 * Math.PI, pulsarPhaseStep);

export function PulsarBeamIntensityPlotPhase(props: {
	pulsarPhase?: number;
	pulsarAxisInclination: [number, number, number];
	pulsarBeamLatitude: number;
	cameraDirection: [number, number, number];
	pulsarBeamAngle: number;
	isAnimating?: boolean;
	onPulsarPhaseChange?: (phase: number) => void;
}) {
	const {
		pulsarAxisInclination,
		pulsarBeamLatitude,
		cameraDirection,
		pulsarBeamAngle,
	} = props;

	const y = x.map((phase) => {
		const dir = pulsarBeamDirection(
			phase,
			pulsarAxisInclination,
			pulsarBeamLatitude,
		);
		return pulsarBeamIntensity(dir, cameraDirection, pulsarBeamAngle);
	});

	return (
		<div id="pulsarBeamIntensityPlotPhase">
			<Plot
				data={[
					{
						x: x,
						y: y,
						type: "scattergl",
						mode: "lines",
					},
				]}
				layout={{
					xaxis: { range: [0, 2 * Math.PI], fixedrange: true },
					yaxis: { range: [0, 1], fixedrange: true },
					plot_bgcolor: "white",
					paper_bgcolor: "white",
					dragmode: false,
					autosize: true,
				}}
				useResizeHandler={true}
			/>
		</div>
	);
}

export function PulsarBeamIntensityPlotTime(props: {
	pulsarBeamDirection: [number, number, number];
	cameraDirection: [number, number, number];
	pulsarBeamAngle: number;
	isAnimating?: boolean;
}) {
	return;
}
