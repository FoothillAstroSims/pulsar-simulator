import Plotly from "plotly.js-dist-min";
import factoryImport from "react-plotly.js/factory";

// Hack to allow Plotly's React component to work with Vite
const createPlotlyComponent =
	(factoryImport as unknown as { default?: typeof factoryImport }).default ??
	factoryImport;
const Plot = createPlotlyComponent(Plotly);

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DISPLAY_FRAME_RATE } from "../utils";
import {
	getPulsarBeamDirection,
	getPulsarBeamIntensity,
	PULSAR_PHASE_DEF_MAX,
	PULSAR_PHASE_DEG_MIN,
	pulsarPhaseDegToRad,
	PULSAR_PHASE_DEG_XAXIS,
	type Triplet,
} from "./utils-pulsar";

// Phase-based plot constants
const Y0 = -(2 ** 51) + 1.5; // Fixed y-values for the timeline in the phase-based plot
const Y1 = 2 ** 51;

// Time-based plot constants
const MAX_POINTS = 6 * DISPLAY_FRAME_RATE; // Max number of points to render at once on the time-based plot. Generally should equal (display refresh rate) * (number of seconds of past data to show)
const X_RANGE_LEN_TIME_DEFAULT = MAX_POINTS / DISPLAY_FRAME_RATE; // Default x range length
const X_RANGE_TIME_DEFAULT: [number, number] = [-0.1, X_RANGE_LEN_TIME_DEFAULT]; // Default x range
const Y_RANGE_TIME_DEFAULT: [number, number] = [-0.01, 1.05]; // Default y range
const X_MIN_ALLOWED_TIME_DEFAULT = 0; // Default x minallowed
const X_MAX_ALLOWED_TIME_DEFAULT = X_RANGE_LEN_TIME_DEFAULT; // Default x maxallowed

// Phase-based pulsar beam intensity plot
export function PulsarBeamIntensityPlotPhase(props: {
	pulsarPhase: number; // See PulsarModelProps in PulsarModel.tsx for descriptions of the pulsar-related parameters
	pulsarAxisEuler: Triplet;
	pulsarBeamLatitude: number;
	cameraDirection: Triplet;
	pulsarBeamAngle: number;
	isAnimating: boolean;
	showPhaseTimeline: boolean; // Show a draggable timeline that matches the pulsar phase
	showPhaseTimelineLabel: boolean; // Show a label atop the timeline
	onPulsarPhaseChange?: (phase: number) => void;
}) {
	const {
		pulsarPhase,
		pulsarAxisEuler,
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

	// Beam intensity values at each pulsar phase
	// This is memoized so as not to trigger a re-calculation on every prop change
	const pulsarPhaseY = useMemo(
		() =>
			PULSAR_PHASE_DEG_XAXIS.map((x) => {
				const dir = getPulsarBeamDirection(
					pulsarPhaseDegToRad(x),
					pulsarAxisEuler,
					pulsarBeamLatitude,
				);
				return getPulsarBeamIntensity(dir, cameraDirection, pulsarBeamAngle);
			}),
		[pulsarAxisEuler, pulsarBeamLatitude, cameraDirection, pulsarBeamAngle],
	);

	// Data
	const data: Partial<Plotly.Data> = useMemo(() => {
		return {
			x: PULSAR_PHASE_DEG_XAXIS,
			y: pulsarPhaseY,
			type: "scattergl",
			mode: "lines",
			line: {
				shape: "spline",
				width: 4,
			},
		};
	}, [pulsarPhaseY]);

	// Draggable timeline bar
	const pulsarPhaseTimeline = useMemo(() => {
		if (!showPhaseTimeline) return;

		const timeline: Partial<Plotly.Shape> = {
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
			timeline.label = {
				text: `Phase: ${pulsarPhase.toFixed(3)}`,
				font: {
					size: 20,
					shadow: "lightgray 1px 1px 1px",
				},
				xanchor: "right",
				yanchor: "middle",
			};
		}

		return timeline;
	}, [pulsarPhase, showPhaseTimeline, showPhaseTimelineLabel, y0, y1]);

	// Layout
	const layout: Partial<Plotly.Layout> = useMemo(() => {
		return {
			xaxis: {
				title: {
					text: "Phase",
				},
				range: [PULSAR_PHASE_DEG_MIN - 0.1, PULSAR_PHASE_DEF_MAX + 0.1],
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
			shapes: pulsarPhaseTimeline !== undefined ? [pulsarPhaseTimeline] : [],
			margin: { l: 0, r: 0, b: 0, t: 0 },
			plot_bgcolor: "white",
			paper_bgcolor: "white",
			dragmode: false,
			autosize: true,
		};
	}, [pulsarPhaseTimeline]);

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
				// console.log(e);
				let x0Update = plotlyRelayoutEvent["shapes[0].x0"] as number | null;

				if (x0Update !== null && x0Update !== undefined) {
					// Prevent timeline from being moved out of frame
					// TODO: Fix bug where moving timeline when it is at the min or max allows it to be moved out of frame
					if (x0Update <= PULSAR_PHASE_DEG_MIN) x0Update = PULSAR_PHASE_DEG_MIN;
					if (x0Update >= PULSAR_PHASE_DEF_MAX) x0Update = PULSAR_PHASE_DEF_MAX;

					onPulsarPhaseChange?.(x0Update);
				}
			}
		},
		[isAnimating, showPhaseTimeline, onPulsarPhaseChange],
	);

	return (
		<Plot
			className="pulsar-plot"
			data={[data]}
			layout={layout}
			config={config}
			onRelayout={handleRelayout}
			useResizeHandler
		/>
	);
}

// Live updating time-based pulsar beam intensity plot
export function PulsarBeamIntensityPlotTime(props: {
	ref?: React.RefObject<Record<string, unknown> | null>;
	pulsarPhase: number; // See PulsarModelProps in PulsarModel.tsx for descriptions of the pulsar-related parameters
	pulsarAxisEuler: Triplet;
	pulsarBeamLatitude: number;
	cameraDirection: Triplet;
	pulsarBeamAngle: number;
	isAnimating: boolean;
}) {
	const {
		ref,
		pulsarPhase,
		pulsarAxisEuler,
		pulsarBeamLatitude,
		cameraDirection,
		pulsarBeamAngle,
		isAnimating,
	} = props;

	const gdRef = useRef<Plotly.Root>(null); // Div element that the Plot component is rendered inside
	const xCounterRef = useRef(0); // Counter used to help update plot data
	const xRangeLenRef = useRef(X_RANGE_LEN_TIME_DEFAULT); // x-axis range length
	const hasInitializedRef = useRef(false); // Flag that tracks whether the stream has intialized

	// Initial data point and style
	// Bit of a hack to capture the values of the props when the component is first mounted and not from any subsequent re-renders
	const [data] = useState<Partial<Plotly.PlotData>[]>([
		{
			x: [0],
			y: [
				getPulsarBeamIntensity(
					getPulsarBeamDirection(
						pulsarPhase,
						pulsarAxisEuler,
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

	// Generate a new point on the plot in a form that can be used for Plotly's update and extendTrace methods
	const generatePointUpdate = useCallback(
		(x: number): Partial<Plotly.Data> => {
			if (
				cameraDirection === undefined ||
				pulsarAxisEuler === undefined ||
				pulsarBeamAngle === undefined ||
				pulsarBeamLatitude === undefined ||
				pulsarPhase === undefined
			)
				return {};

			return {
				x: [[x]],
				y: [
					[
						getPulsarBeamIntensity(
							getPulsarBeamDirection(
								pulsarPhase,
								pulsarAxisEuler,
								pulsarBeamLatitude,
							),
							cameraDirection,
							pulsarBeamAngle,
						),
					],
				],
			};
		},
		[
			cameraDirection,
			pulsarAxisEuler,
			pulsarBeamAngle,
			pulsarBeamLatitude,
			pulsarPhase,
		],
	);

	// Expose parameters and methods through the ref prop
	useEffect(() => {
		if (!ref) return;

		ref.current = {
			// Clear the plot and reset the x range
			resetPlot: () => {
				const gd = gdRef.current;
				if (!gd) return;

				// Reset refs
				xCounterRef.current = 0;
				xRangeLenRef.current = X_RANGE_LEN_TIME_DEFAULT;
				hasInitializedRef.current = false;

				// Replace the data and layout of the current trace with initial, default values
				Plotly.update(
					gd,
					generatePointUpdate(0),
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
	}, [ref, generatePointUpdate]);

	// Stream beam intensity data from prop changes
	useEffect(() => {
		// Prevent adding a new point at the very start, to prevent double-plotting of the initial value
		if (!hasInitializedRef.current) {
			hasInitializedRef.current = true;
			return;
		}

		const gd = gdRef.current;
		if (!gd) return;

		// console.log("tick");
		xCounterRef.current += 1; // Increase x-coordinate by one
		const xUpdate = xCounterRef.current / DISPLAY_FRAME_RATE; // Get updated x-coordinate
		const xRangeLen = xRangeLenRef.current; // Get the current range length

		// Change x range if it exceeds the current range length. This causes the plot to scroll continuously
		if (xUpdate >= xRangeLen) {
			Plotly.relayout(gd, {
				"xaxis.range": [xUpdate - xRangeLen, xUpdate],
				"xaxis.maxallowed": xUpdate,
			} as Partial<Plotly.Layout>);
		}

		// extendTraces is more efficient than React's native state management
		Plotly.extendTraces(gd, generatePointUpdate(xUpdate), [0]);
	}, [generatePointUpdate]);

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
			className="pulsar-plot"
			data={data}
			layout={layout}
			config={config}
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
