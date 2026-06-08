import Plotly from "plotly.js-dist-min";
import factoryImport from "react-plotly.js/factory";

// Hack to allow Plotly's React component to work with Vite
const createPlotlyComponent =
	(factoryImport as unknown as { default?: typeof factoryImport }).default ??
	factoryImport;
const Plot = createPlotlyComponent(Plotly);

import {
	getPulsarBeamDirection,
	getPulsarBeamIntensity,
	range,
	DISPLAY_FRAME_RATE,
} from "../utils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Pulsar phase range
export const pulsarPhaseStep = 0.001;
export const pulsarPhaseMin = 0.0;
export const pulsarPhaseMax = 2 * Math.PI;
const x = range(pulsarPhaseMin, pulsarPhaseMax, pulsarPhaseStep);

// Fixed y-values for the timeline in the phase-based plot
const Y0 = Number.MIN_SAFE_INTEGER + 1;
const Y1 = Number.MAX_SAFE_INTEGER;

const MAX_POINTS = 6 * DISPLAY_FRAME_RATE; // Max number of points to render at once on the time-based plot. Generally should equal (display refresh rate) * (number of seconds of past data to show)

// Phase-based pulsar beam intensity plot
export function PulsarBeamIntensityPlotPhase(props: {
	pulsarPhase: number; // See PulsarModelProps in PulsarModel.tsx for descriptions of the pulsar-related parameters
	pulsarAxisInclination: [number, number, number];
	pulsarBeamLatitude: number;
	cameraDirection: [number, number, number];
	pulsarBeamAngle: number;
	isAnimating: boolean;
	showPhaseTimeline: boolean; // Show a draggable timeline that matches the pulsar phase
	showPhaseTimelineLabel: boolean; // Show a label atop the timeline
	onPulsarPhaseChange: (phase: number) => void;
}) {
	const {
		pulsarPhase,
		pulsarAxisInclination,
		pulsarBeamLatitude,
		cameraDirection,
		pulsarBeamAngle,
		isAnimating,
		showPhaseTimeline,
		showPhaseTimelineLabel,
		onPulsarPhaseChange,
	} = props;
	const [y0, setY0] = useState(Y0);
	const [y1, setY1] = useState(Y1);

	// Graph elements
	// Graph of beam intensity
	const y = x.map((phase) => {
		const dir = getPulsarBeamDirection(
			phase,
			pulsarAxisInclination,
			pulsarBeamLatitude,
		);
		return getPulsarBeamIntensity(dir, cameraDirection, pulsarBeamAngle);
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

	// Plot layout
	const layout: Partial<Plotly.Layout> = useMemo(() => {
		const l: Partial<Plotly.Layout> = {
			xaxis: {
				range: [-0.1, 2 * Math.PI + 0.1],
				griddash: "dash",
				gridcolor: "lightgray",
				zeroline: false,
				fixedrange: true,
				automargin: true,
			},
			yaxis: {
				range: [-0.01, 1.01],
				griddash: "dash",
				gridcolor: "lightgray",
				zeroline: false,
				fixedrange: true,
				automargin: true,
			},
			margin: { l: 0, r: 0, b: 0, t: 10 },
			plot_bgcolor: "white",
			paper_bgcolor: "white",
			dragmode: false,
			autosize: true,
		};

		// Phase timeline bar
		if (showPhaseTimeline) {
			const pulsarPhaseTimelineBar: Partial<Plotly.Shape> = {
				type: "line",
				xref: "x",
				yref: "paper",
				x0: pulsarPhase,
				x1: pulsarPhase,
				y0: y0,
				y1: y1,
				line: {
					color: "red",
					dash: "dash",
					width: 4,
				},
			};
			if (showPhaseTimelineLabel) {
				pulsarPhaseTimelineBar.label = {
					text: `Phase: ${pulsarPhase.toFixed(3)}`,
					font: {
						size: 20,
						shadow: "lightgray 1px 1px 1px",
					},
					yanchor: "middle",
					padding: 10,
				};
			}
			l.shapes = [pulsarPhaseTimelineBar];
		}

		return l;
	}, [pulsarPhase, showPhaseTimeline, showPhaseTimelineLabel, y0, y1]);

	// Plotly relayout event handler
	const handleRelayout = useCallback(
		(e: Plotly.PlotRelayoutEvent) => {
			if (showPhaseTimeline && !isAnimating) {
				// "Prevent" timeline from being moved up and down (in reality, just set the y-endpoints to the largest values possible)
				setY0(Y0);
				setY1(Y1);

				// Update pulsar phase to where the timeline ends up
				const plotlyRelayoutEvent = e as unknown as Record<string, unknown>;
				let x0Update = plotlyRelayoutEvent["shapes[0].x0"] as number | null;

				if (x0Update !== null && x0Update !== undefined) {
					// Prevent timeline from being moved out of frame
					// TODO: Fix bug where moving timeline when it is at the min or max allows it to be moved out of frame
					if (x0Update <= pulsarPhaseMin) x0Update = pulsarPhaseMin;
					if (x0Update >= pulsarPhaseMax) x0Update = pulsarPhaseMax;

					onPulsarPhaseChange(x0Update);
				}
			}
		},
		[isAnimating, showPhaseTimeline, onPulsarPhaseChange],
	);

	return (
		<div className="pulsar-plot pulsar-plot-phase">
			<Plot
				data={[pulsarBeamIntensityData]}
				layout={layout}
				config={{ edits: { shapePosition: !isAnimating } }}
				onRelayout={handleRelayout}
				useResizeHandler // TODO: Figure out how to resize the plot so that it always fits on the screen: https://github.com/plotly/react-plotly.js/issues/76
			/>
		</div>
	);
}

// Live updating time-based pulsar beam intensity plot
export function PulsarBeamIntensityPlotTime(props: {
	pulsarPhase: number; // See PulsarModelProps in PulsarModel.tsx for descriptions of the pulsar-related parameters
	pulsarAxisInclination: [number, number, number];
	pulsarBeamLatitude: number;
	cameraDirection: [number, number, number];
	pulsarBeamAngle: number;
	isAnimating?: boolean;
}) {
	const {
		pulsarPhase,
		pulsarAxisInclination,
		pulsarBeamLatitude,
		cameraDirection,
		pulsarBeamAngle,
	} = props;
	const gdRef = useRef<Plotly.Root>(null); // div element that the Plot component is rendered inside
	const [data] = useState<Partial<Plotly.PlotData>[]>([
		{
			x: [0],
			y: [
				getPulsarBeamIntensity(
					getPulsarBeamDirection(
						pulsarPhase,
						pulsarAxisInclination,
						pulsarBeamLatitude,
					),
					cameraDirection,
					pulsarBeamAngle,
				),
			],
			type: "scattergl",
			mode: "lines",
			line: {
				shape: "spline",
				width: 4,
			},
		},
	]); // Initial data point + plot type
	const xCounter = useRef(0); // Counter used to help update plot data

	// Layout
	const layout: Partial<Plotly.Layout> = useMemo(() => {
		return {
			xaxis: {
				rangemode: "nonnegative",
			},
			yaxis: { range: [-0.01, 1.01], fixedrange: true, automargin: true },
			margin: { l: 0, r: 0, t: 10 },
			plot_bgcolor: "white",
			paper_bgcolor: "white",
			dragmode: false,
			autosize: true,
		};
	}, []);

	// Stream beam intensity data from prop changes
	useEffect(() => {
		const gd = gdRef.current;
		if (!gd) return;

		if (
			getPulsarBeamDirection !== undefined &&
			cameraDirection !== undefined &&
			pulsarBeamAngle !== undefined
		) {
			xCounter.current += 1;

			// extendTraces is much more efficient than React's native state management
			Plotly.extendTraces(
				gd,
				{
					x: [[xCounter.current]],
					y: [
						[
							getPulsarBeamIntensity(
								getPulsarBeamDirection(
									pulsarPhase,
									pulsarAxisInclination,
									pulsarBeamLatitude,
								),
								cameraDirection,
								pulsarBeamAngle,
							),
						],
					],
				},
				[0],
				MAX_POINTS,
			);
		}
	}, [
		pulsarPhase,
		pulsarAxisInclination,
		pulsarBeamLatitude,
		cameraDirection,
		pulsarBeamAngle,
	]);

	return (
		<div className="pulsar-plot pulsar-plot-time">
			<Plot
				data={data}
				layout={layout}
				onInitialized={(_figure, gd) => {
					gdRef.current = gd as unknown as Plotly.Root;
				}}
				onPurge={() => (gdRef.current = null)}
			/>
		</div>
	);
}
