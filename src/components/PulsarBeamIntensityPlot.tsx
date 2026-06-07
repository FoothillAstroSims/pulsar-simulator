import Plotly from "plotly.js-dist-min";
import factoryImport from "react-plotly.js/factory";

// Hack to allow Plotly's React component to work with Vite
const createPlotlyComponent =
	(factoryImport as unknown as { default?: typeof factoryImport }).default ??
	factoryImport;
const Plot = createPlotlyComponent(Plotly);

import { pulsarBeamDirection, pulsarBeamIntensity, range } from "../utils";

export const pulsarPhaseStep = 0.001;
const x = range(0, 2 * Math.PI, pulsarPhaseStep);

// Phase-based pulsar beam intensity plot
export function PulsarBeamIntensityPlotPhase(props: {
	pulsarPhase: number;
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
		<div className="pulsar-plot pulsar-plot-phase">
			<Plot
				data={[
					{
						x: x,
						y: y,
						type: "scattergl",
						mode: "lines",
						line: {
							width: 2,
						},
					},
				]}
				layout={{
					xaxis: {
						range: [0, 2 * Math.PI],
						fixedrange: true,
						automargin: true,
					},
					yaxis: { range: [0, 1], fixedrange: true, automargin: true },
					margin: { l: 0, r: 0, b: 0, t: 0 },
					plot_bgcolor: "white",
					paper_bgcolor: "white",
					dragmode: false,
					autosize: true,
					// TODO: Add vertical line to mark current phase
				}}
				// config={{ responsive: true }}
				useResizeHandler={true} // TODO: Figure out how to resize the plot so that it always fits on the screen: https://github.com/plotly/react-plotly.js/issues/76
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
