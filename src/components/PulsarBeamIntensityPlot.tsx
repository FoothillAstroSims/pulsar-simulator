import Plotly from "plotly.js-dist-min";
import factoryImport from "react-plotly.js/factory";

// Hack to allow Plotly's React component to work with Vite
const createPlotlyComponent =
	(factoryImport as unknown as { default?: typeof factoryImport }).default ??
	factoryImport;
const Plot = createPlotlyComponent(Plotly);

import { pulsarBeamDirection, pulsarBeamIntensity, range } from "../utils";

export const pulsarPhaseStep = 0.001;
export const pulsarPhaseMin = 0.0;
export const pulsarPhaseMax = 2 * Math.PI;
const x = range(pulsarPhaseMin, pulsarPhaseMax, pulsarPhaseStep);

// Phase-based pulsar beam intensity plot
export function PulsarBeamIntensityPlotPhase(props: {
	pulsarPhase: number;
	pulsarAxisInclination: [number, number, number];
	pulsarBeamLatitude: number;
	cameraDirection: [number, number, number];
	pulsarBeamAngle: number;
	isAnimating: boolean;
	onPulsarPhaseChange: (phase: number) => void;
}) {
	const {
		pulsarPhase,
		pulsarAxisInclination,
		pulsarBeamLatitude,
		cameraDirection,
		pulsarBeamAngle,
		isAnimating,
		onPulsarPhaseChange,
	} = props;

	// Graph elements
	const y = x.map((phase) => {
		const dir = pulsarBeamDirection(
			phase,
			pulsarAxisInclination,
			pulsarBeamLatitude,
		);
		return pulsarBeamIntensity(dir, cameraDirection, pulsarBeamAngle);
	});
	const pulsarBeamIntensityData: Partial<Plotly.Data> = {
		x: x,
		y: y,
		type: "scattergl",
		mode: "lines",
		line: {
			width: 4,
		},
	};
	const pulsarPhaseTimelineBar: Partial<Plotly.Shape> = {
		type: "line",
		xref: "x",
		yref: "paper",
		x0: pulsarPhase,
		x1: pulsarPhase,
		y0: Number.MIN_SAFE_INTEGER,
		y1: Number.MAX_SAFE_INTEGER,
		line: {
			color: "red",
			width: 5,
		},
	};

	// Plotly relayout event handler
	const handleRelayout = (e: Plotly.PlotRelayoutEvent) => {
		// console.log(e);
		if (!isAnimating) {
			// Update pulsar phase to where the timeline bar ends up
			const x0 = (e as unknown as Record<string, unknown>)["shapes[0].x0"];
			let x0Update = (x0 ?? pulsarPhaseTimelineBar.x0) as number;
			if (x0Update < pulsarPhaseMin) x0Update = pulsarPhaseMin;
			if (x0Update > pulsarPhaseMax) x0Update = pulsarPhaseMax;
			onPulsarPhaseChange(x0Update);
		}
	};

	return (
		<div className="pulsar-plot pulsar-plot-phase">
			<Plot
				// ref={plotRef}
				data={[pulsarBeamIntensityData]}
				layout={{
					shapes: [pulsarPhaseTimelineBar],
					xaxis: {
						range: [0, 2 * Math.PI],
						fixedrange: true,
						automargin: true,
					},
					yaxis: { range: [0, 1], fixedrange: true, automargin: true },
					margin: { l: 0, r: 0, b: 0, t: 10 },
					plot_bgcolor: "white",
					paper_bgcolor: "white",
					dragmode: false,
					autosize: true,
				}}
				config={{ edits: { shapePosition: !isAnimating } }}
				onRelayout={handleRelayout}
				useResizeHandler // TODO: Figure out how to resize the plot so that it always fits on the screen: https://github.com/plotly/react-plotly.js/issues/76
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
