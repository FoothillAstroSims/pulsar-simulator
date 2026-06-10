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

// Parameters and methods from the time-based plot to expose to the parent node
export interface PulsarPlotTimeRef {
	resetPlot: () => void; // Clear the plot and reset the x range
}

// Pulsar phase range
export const pulsarPhaseStep = 0.001;
export const pulsarPhaseMin = 0.0;
export const pulsarPhaseMax = 2 * Math.PI;
const x = range(pulsarPhaseMin, pulsarPhaseMax, pulsarPhaseStep);

// Phase-based plot constants
const Y0 = -(2 ** 51) + 1.5; // Fixed y-values for the timeline in the phase-based plot
const Y1 = 2 ** 51;

// Time-based plot constants
const MAX_POINTS = 6 * DISPLAY_FRAME_RATE; // Max number of points to render at once on the time-based plot. Generally should equal (display refresh rate) * (number of seconds of past data to show)
const X_RANGE_LEN_TIME_DEFAULT = MAX_POINTS; // Default x range length
const X_RANGE_TIME_DEFAULT: [number, number] = [-0.1, X_RANGE_LEN_TIME_DEFAULT]; // Default x range
const Y_RANGE_TIME_DEFAULT: [number, number] = [-0.01, 1.05]; // Default y range
const X_MIN_ALLOWED_TIME_DEFAULT = 0; // Default x minallowed
const X_MAX_ALLOWED_TIME_DEFAULT = X_RANGE_LEN_TIME_DEFAULT; // Default x maxallowed

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
	onPulsarPhaseChange?: (phase: number) => void;
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

	// State variables for the timeline y endpoints
	const [y0, setY0] = useState(Y0);
	const [y1, setY1] = useState(Y1);

	// Graph of beam intensity
	const y = x.map((phase) => {
		const dir = getPulsarBeamDirection(
			phase,
			pulsarAxisInclination,
			pulsarBeamLatitude,
		);
		return getPulsarBeamIntensity(dir, cameraDirection, pulsarBeamAngle);
	});

	// Data
	const data: Partial<Plotly.Data> = {
		x: x,
		y: y,
		type: "scattergl",
		mode: "lines",
		line: {
			width: 4,
		},
	};

	// Layout
	const layout: Partial<Plotly.Layout> = useMemo(() => {
		const l: Partial<Plotly.Layout> = {
			xaxis: {
				title: {
					text: "Phase",
				},
				range: [-0.1, 2 * Math.PI + 0.1],
				griddash: "dash",
				gridcolor: "lightgray",
				zeroline: false,
				fixedrange: true,
				automargin: true,
			},
			yaxis: {
				title: {
					text: "Beam intensity",
				},
				range: [-0.01, 1.05],
				griddash: "dash",
				gridcolor: "lightgray",
				zeroline: false,
				fixedrange: true,
				automargin: true,
			},
			margin: { l: 0, r: 0, b: 0, t: 0 },
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
					xanchor: "right",
					yanchor: "middle",
				};
			}
			l.shapes = [pulsarPhaseTimelineBar];
		}

		return l;
	}, [pulsarPhase, showPhaseTimeline, showPhaseTimelineLabel, y0, y1]);

	// Config
	const config = useMemo<Partial<Plotly.Config>>(() => {
		return { edits: { shapePosition: !isAnimating } }; // Allow movement of the timeline only when the animation is stopped
	}, [isAnimating]);

	// Plotly relayout event handler
	// TODO: Try to get the `plotly_relayouting` event to work so that the phase can be updated continuously
	const handleRelayout = useCallback(
		(e: Plotly.PlotRelayoutEvent) => {
			if (showPhaseTimeline && !isAnimating) {
				// Prevent timeline from being moved up and down by setting y endpoints back to original positions
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

					onPulsarPhaseChange?.(x0Update);
				}
			}
		},
		[isAnimating, showPhaseTimeline, onPulsarPhaseChange],
	);

	return (
		<Plot
			data={[data]}
			layout={layout}
			config={config}
			style={{ width: "100%", height: "100%" }} // Required for auto-resizing to be able to take effect
			onRelayout={handleRelayout}
			useResizeHandler
		/>
	);
}

// Live updating time-based pulsar beam intensity plot
export function PulsarBeamIntensityPlotTime(props: {
	ref?: React.RefObject<PulsarPlotTimeRef | null>;
	pulsarPhase: number; // See PulsarModelProps in PulsarModel.tsx for descriptions of the pulsar-related parameters
	pulsarAxisInclination: [number, number, number];
	pulsarBeamLatitude: number;
	cameraDirection: [number, number, number];
	pulsarBeamAngle: number;
	isAnimating: boolean;
}) {
	const {
		ref,
		pulsarPhase,
		pulsarAxisInclination,
		pulsarBeamLatitude,
		cameraDirection,
		pulsarBeamAngle,
		isAnimating,
	} = props;

	const gdRef = useRef<Plotly.Root>(null); // Div element that the Plot component is rendered inside
	const xCounterRef = useRef(0); // Counter used to help update plot data
	const xRangeLenRef = useRef(X_RANGE_LEN_TIME_DEFAULT); // x-axis range length

	// Initial data point, captures the values of the props when the component is first mounted
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
	]);

	// Layout
	const layout: Partial<Plotly.Layout> = useMemo(() => {
		return {
			xaxis: {
				title: {
					text: "Time (s)",
				},
				range: X_RANGE_TIME_DEFAULT,
				griddash: "dash",
				gridcolor: "lightgray",
				rangemode: "nonnegative",
				minallowed: X_MIN_ALLOWED_TIME_DEFAULT,
				maxallowed: X_MAX_ALLOWED_TIME_DEFAULT,
				zeroline: false,
				automargin: true,
			},
			yaxis: {
				title: {
					text: "Beam intensity",
				},
				range: Y_RANGE_TIME_DEFAULT,
				griddash: "dash",
				gridcolor: "lightgray",
				zeroline: false,
				fixedrange: true,
				automargin: true,
			},
			margin: { l: 0, r: 0, b: 0, t: 0 },
			plot_bgcolor: "white",
			paper_bgcolor: "white",
			dragmode: "pan",
			autosize: true,
		};
	}, []);

	// Config
	const config: Partial<Plotly.Config> = useMemo(() => {
		return {
			modeBarButtonsToRemove: ["resetScale2d"], // TODO(?): Implement custom reset scale button that jumps to the most recent data
		};
	}, []);

	// Expose parameters and methods through the ref prop
	useEffect(() => {
		if (!ref) return;

		ref.current = {
			// Clear the plot and reset the x range
			resetPlot: () => {
				const gd = gdRef.current;
				if (!gd) return;

				// Reset plot layout refs
				xCounterRef.current = 0;
				xRangeLenRef.current = X_RANGE_LEN_TIME_DEFAULT;

				// Replace the data and layout of the current trace with initial, default values
				Plotly.update(
					gd,
					{
						x: [[0]],
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
					{
						"xaxis.range": X_RANGE_TIME_DEFAULT,
						"xaxis.minallowed": X_MIN_ALLOWED_TIME_DEFAULT,
						"xaxis.maxallowed": X_MAX_ALLOWED_TIME_DEFAULT,
						"yaxis.range": Y_RANGE_TIME_DEFAULT,
					} as Partial<Plotly.Layout>,
					[0],
				);
			},
		};
	}, [
		cameraDirection,
		pulsarAxisInclination,
		pulsarBeamAngle,
		pulsarBeamLatitude,
		pulsarPhase,
		ref,
	]);

	// Stream beam intensity data from prop changes
	useEffect(() => {
		const gd = gdRef.current;
		if (!gd) return;

		if (
			getPulsarBeamDirection !== undefined &&
			cameraDirection !== undefined &&
			pulsarBeamAngle !== undefined
		) {
			xCounterRef.current += 1; // Increase x-coordinate by one
			const xUpdate = xCounterRef.current; // Get updated x-coordinate
			const xRangeLen = xRangeLenRef.current; // Get the current range length

			// Change x range if it exceeds the current range length. This causes the plot to scroll continuously
			if (xUpdate >= xRangeLen) {
				Plotly.relayout(gd, {
					"xaxis.range": [xUpdate - xRangeLen, xUpdate],
					"xaxis.maxallowed": xUpdate,
				} as Partial<Plotly.Layout>);
			}

			// extendTraces is more efficient than React's native state management
			Plotly.extendTraces(
				gd,
				{
					x: [[xUpdate]],
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
			);
		}
	}, [
		pulsarPhase,
		pulsarAxisInclination,
		pulsarBeamLatitude,
		cameraDirection,
		pulsarBeamAngle,
	]);

	// Toggle plot hovering and zooming/panning based on the animation
	useEffect(() => {
		const gd = gdRef.current;
		if (!gd) return;

		if (isAnimating) {
			Plotly.relayout(gd, {
				hovermode: false,
				"xaxis.fixedrange": true,
			} as Partial<Plotly.Layout>);
		} else {
			Plotly.relayout(gd, {
				hovermode: "closest",
				"xaxis.fixedrange": false,
			} as Partial<Plotly.Layout>);
		}
	}, [isAnimating]);

	return (
		<Plot
			data={data}
			layout={layout}
			config={config}
			style={{ width: "100%", height: "100%" }} // Required for auto-resizing to be able to take effect
			onInitialized={(_figure, gd) => {
				gdRef.current = gd as unknown as Plotly.Root; // Get reference to the graph div
			}}
			onUpdate={(figure) => {
				// Capture the length of the x range after a layout change
				const xRange = figure.layout.xaxis?.range as [number, number];
				if (xRange) xRangeLenRef.current = Math.round(xRange[1] - xRange[0]);
			}}
			onPurge={() => (gdRef.current = null)}
			useResizeHandler
		/>
	);
}
