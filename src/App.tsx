import "bootstrap/dist/css/bootstrap.min.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import {
	PulsarBeamIntensityPlotPhase,
	PulsarBeamIntensityPlotTime,
} from "./components/PulsarBeamIntensityPlot";
import { PulsarModel } from "./components/PulsarModel";
import { PulsarParameterInput } from "./components/PulsarParameterInput";
import { PulsarSkyView } from "./components/PulsarSkyView";
import {
	CAMERA_POSITION_DEFAULT,
	IS_ANIMATING_DEFAULT,
	ORBIT_CONTROLS_ENABLED_DEFAULT,
	PULSAR_AXIS_EULER_DEG_DEFAULT,
	PULSAR_AXIS_EULER_DEG_MAX,
	PULSAR_AXIS_EULER_DEG_MIN,
	PULSAR_AXIS_EULER_DEG_STEP,
	PULSAR_BEAM_HEIGHT,
	PULSAR_BEAM_LATITUDE_DEG_DEFAULT,
	PULSAR_BEAM_LATITUDE_DEG_MAX,
	PULSAR_BEAM_LATITUDE_DEG_MIN,
	PULSAR_BEAM_LATITUDE_DEG_STEP,
	PULSAR_BEAM_RADIUS_DEFAULT,
	PULSAR_BEAM_RADIUS_MAX,
	PULSAR_BEAM_RADIUS_MIN,
	PULSAR_BEAM_RADIUS_STEP,
	PULSAR_PERIOD_DEFAULT,
	PULSAR_PERIOD_MAX,
	PULSAR_PERIOD_MIN,
	PULSAR_PERIOD_STEP,
	PULSAR_PHASE_DEF_MAX,
	PULSAR_PHASE_DEG_DEFAULT,
	PULSAR_PHASE_DEG_MIN,
	PULSAR_PHASE_DEG_STEP,
	pulsarAxisEulerDegToRad,
	pulsarBeamLatitudeDegToRad,
	pulsarPhaseDegToRad,
	type Triplet,
} from "./components/pulsar-config";
import { createKeyDownEventHandler } from "./utils";

export default function App() {
	// Initialize state variables
	const [pulsarPhaseDeg, setPulsarPhaseDeg] = useState(
		PULSAR_PHASE_DEG_DEFAULT,
	);
	const [pulsarPeriod, setPulsarPeriod] = useState(PULSAR_PERIOD_DEFAULT);
	const [pulsarBeamLatitudeDeg, setPulsarBeamLatitudeDeg] = useState(
		PULSAR_BEAM_LATITUDE_DEG_DEFAULT,
	);
	const [pulsarAxisEulerDeg, setPulsarAxisEulerDeg] = useState<Triplet>(
		PULSAR_AXIS_EULER_DEG_DEFAULT,
	);
	const [pulsarBeamRadius, setPulsarBeamRadius] = useState(
		PULSAR_BEAM_RADIUS_DEFAULT,
	);
	const [cameraPosition, setCameraPosition] = useState(CAMERA_POSITION_DEFAULT);
	const [isAnimating, setIsAnimating] = useState(IS_ANIMATING_DEFAULT);
	const [orbitControlsEnabled, setOrbitControlsEnabled] = useState(
		ORBIT_CONTROLS_ENABLED_DEFAULT,
	);
	const [showPulsarEquator, setShowPulsarEquator] = useState(true);
	const [showPulsarAxis, setShowPulsarAxis] = useState(true);
	const [showPhaseTimeline, setShowPhaseTimeline] = useState(true);
	const [showPhaseTimelineLabel, setShowPhaseTimelineLabel] = useState(false);

	// Memoized values calculated from state variables
	const pulsarPhaseRad = useMemo(
		() => pulsarPhaseDegToRad(pulsarPhaseDeg),
		[pulsarPhaseDeg],
	);
	const pulsarBeamLatitudeRad = useMemo(
		() => pulsarBeamLatitudeDegToRad(pulsarBeamLatitudeDeg),
		[pulsarBeamLatitudeDeg],
	);
	const pulsarAxisEulerRad = useMemo(
		() => pulsarAxisEulerDegToRad(pulsarAxisEulerDeg),
		[pulsarAxisEulerDeg],
	);
	const pulsarBeamAngleRad = useMemo(
		() => Math.atan(pulsarBeamRadius / PULSAR_BEAM_HEIGHT),
		[pulsarBeamRadius],
	);

	// References to components
	const pulsarModelRef = useRef<Record<string, unknown> | null>(null);
	const pulsarPlotTimeRef = useRef<Record<string, unknown> | null>(null);

	/** Callback to reset all model parameters */
	const resetPulsarParameters = useCallback(() => {
		if (!isAnimating) {
			setPulsarPhaseDeg(PULSAR_PHASE_DEG_DEFAULT);
			setPulsarPeriod(PULSAR_PERIOD_DEFAULT);
			setPulsarAxisEulerDeg(PULSAR_AXIS_EULER_DEG_DEFAULT);
			setPulsarBeamLatitudeDeg(PULSAR_BEAM_LATITUDE_DEG_DEFAULT);
			setPulsarBeamRadius(PULSAR_BEAM_RADIUS_DEFAULT);
			// console.log("Pulsar parameters reset");
		}
	}, [isAnimating]);

	// Register keyboard event handlers
	useEffect(() => {
		/** Keyboard event handler for starting and stopping animation */
		const isAnimatingHandler = createKeyDownEventHandler(["p", "P"], () =>
			setIsAnimating((prev) => !prev),
		);
		window.addEventListener("keydown", isAnimatingHandler);

		/** Keyboard event handler for resetting the camera position */
		const resetCameraHandler = createKeyDownEventHandler(["c", "C"], () =>
			(pulsarModelRef.current?.resetCamera as () => void)(),
		);
		window.addEventListener("keydown", resetCameraHandler);

		/** Keyboard event handler for resetting pulsar model parameters */
		const resetPulsarParametersHandler = createKeyDownEventHandler(
			["r", "R"],
			() => resetPulsarParameters(),
		);
		window.addEventListener("keydown", resetPulsarParametersHandler);

		return () => {
			window.removeEventListener("keydown", isAnimatingHandler);
			window.removeEventListener("keydown", resetCameraHandler);
			window.removeEventListener("keydown", resetPulsarParametersHandler);
		};
	}, [resetPulsarParameters]);

	return (
		<>
			<div className="pulsar-parameters">
				<div style={{ flex: 1, display: "flex", justifyItems: "center" }}>
					<button type="button" onClick={() => setIsAnimating((prev) => !prev)}>
						{isAnimating ? "Stop" : "Start"}
					</button>
					<button
						type="button"
						disabled={isAnimating}
						onClick={() => resetPulsarParameters()}
					>
						Reset parameters
					</button>
					<button
						type="button"
						disabled={!orbitControlsEnabled}
						onClick={() => {
							(pulsarModelRef.current?.resetCamera as () => void)();
							// console.log("Camera reset");
						}}
					>
						Reset camera
					</button>
					<label>
						<input
							type="checkbox"
							checked={!orbitControlsEnabled}
							onChange={() => {
								setOrbitControlsEnabled((prev) => !prev);
								// console.log(
								// 	`Orbit controls ${orbitControlsEnabled ? "disabled" : "enabled"}`,
								// );
							}}
						/>
						Lock camera
					</label>
				</div>
				<PulsarParameterInput
					name="pulsarPhase"
					label="Phase (°)"
					min={PULSAR_PHASE_DEG_MIN}
					max={PULSAR_PHASE_DEF_MAX}
					step={PULSAR_PHASE_DEG_STEP}
					value={pulsarPhaseDeg}
					disabled={isAnimating}
					onChange={(e) => {
						if (e.target.value) setPulsarPhaseDeg(parseFloat(e.target.value));
						// console.log(`Pulsar phase: ${e.target.value}`);
					}}
				/>{" "}
				<PulsarParameterInput
					name="pulsarPeriod"
					label="Period (s)"
					min={PULSAR_PERIOD_MIN}
					max={PULSAR_PERIOD_MAX}
					step={PULSAR_PERIOD_STEP}
					value={pulsarPeriod}
					onChange={(e) => {
						if (e.target.value) setPulsarPeriod(parseFloat(e.target.value));
						// console.log(`Pulsar period: ${e.target.value}`);
					}}
				/>
				{/* <PulsarParameterInput
					name="pulsarPositionAngle"
					label="Position angle"
					min={pulsarAxisEulerMin[0]}
					max={pulsarAxisEulerMax[0]}
					step={pulsarAxisEulerStep}
					value={pulsarAxisEuler[0]}
					onChange={(e) => {
						setPulsarAxisEuler([
							parseFloat(e.target.value),
							pulsarAxisEuler[1],
							pulsarAxisEuler[2],
						]);
						// console.log(`Pulsar position angle (Euler X): ${e.target.value}`);
					}}
				/>
				{" "} */}
				{/* <PulsarParameterInput
					name="pulsarAxisInclinationY"
					label="Y"
					min={pulsarAxisEulerMin[1]}
					max={pulsarAxisEulerMax[1]}
					step={pulsarAxisEulerStep}
					value={pulsarAxisEuler[1]}
					onChange={(e) => {
						setPulsarAxisEuler([
							pulsarAxisEuler[0],
							parseFloat(e.target.value),
							pulsarAxisEuler[2],
						]);
						// console.log(`Pulsar axis inclination Y: ${e.target.value}`);
					}}
				/> */}
				<PulsarParameterInput
					name="pulsarInclinationAngle"
					label="Inclination angle (°)"
					min={PULSAR_AXIS_EULER_DEG_MIN[2]}
					max={PULSAR_AXIS_EULER_DEG_MAX[2]}
					step={PULSAR_AXIS_EULER_DEG_STEP}
					value={pulsarAxisEulerDeg[2]}
					onChange={(e) => {
						if (e.target.value)
							setPulsarAxisEulerDeg([
								pulsarAxisEulerDeg[0],
								pulsarAxisEulerDeg[1],
								parseFloat(e.target.value),
							]);
						// console.log(`Pulsar inclination (Euler Z): ${e.target.value}`);
					}}
				/>
				<PulsarParameterInput
					name="pulsarBeamLatitude"
					label="Beam latitude (°)"
					min={PULSAR_BEAM_LATITUDE_DEG_MIN}
					max={PULSAR_BEAM_LATITUDE_DEG_MAX}
					step={PULSAR_BEAM_LATITUDE_DEG_STEP}
					value={pulsarBeamLatitudeDeg}
					onChange={(e) => {
						if (e.target.value)
							setPulsarBeamLatitudeDeg(parseFloat(e.target.value));
						// console.log(`Pulsar beam latitude: ${e.target.value}`);
					}}
				/>
				<PulsarParameterInput
					name="pulsarBeamRadius"
					label="Beam radius"
					min={PULSAR_BEAM_RADIUS_MIN}
					max={PULSAR_BEAM_RADIUS_MAX}
					step={PULSAR_BEAM_RADIUS_STEP}
					value={pulsarBeamRadius}
					onChange={(e) => {
						if (e.target.value) setPulsarBeamRadius(parseFloat(e.target.value));
						// console.log(`Pulsar beam angle: ${e.target.value}`);
					}}
				/>
				<div style={{ display: "flex" }}>
					<label style={{ flex: 1 }}>
						<input
							type="checkbox"
							checked={showPulsarEquator}
							onChange={() => setShowPulsarEquator((prev) => !prev)}
						/>
						Show equator
					</label>
					<label style={{ flex: 1 }}>
						<input
							type="checkbox"
							checked={showPulsarAxis}
							onChange={() => setShowPulsarAxis((prev) => !prev)}
						/>
						Show axis of rotation
					</label>
				</div>
			</div>

			<div
				className="pulsar-main"
				style={{
					display: "flex",
					flexDirection: "row",
					width: "100vw",
					height: "75vh",
					minHeight: "400px",
				}}
			>
				<div style={{ flex: 1, minWidth: 0, minHeight: 0 }}>
					<PulsarModel
						ref={pulsarModelRef}
						pulsarPhase={pulsarPhaseRad}
						pulsarPeriod={pulsarPeriod}
						pulsarAxisEuler={pulsarAxisEulerRad}
						pulsarBeamLatitude={pulsarBeamLatitudeRad}
						pulsarBeamRadius={pulsarBeamRadius}
						cameraPosition={cameraPosition}
						isAnimating={isAnimating}
						orbitControlsEnabled={orbitControlsEnabled}
						showPulsarEquator={showPulsarEquator}
						showPulsarAxis={showPulsarAxis}
						onPulsarPhaseChange={setPulsarPhaseDeg}
						onCameraPositionChange={setCameraPosition}
						// showAxesHelper={true}
					/>
				</div>
				<div
					style={{
						flex: 1,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: "5px",
						minWidth: 0,
						minHeight: 0,
					}}
				>
					<div className="pulsar-plot" style={{ flex: 4 }}>
						<PulsarBeamIntensityPlotPhase
							pulsarPhaseDeg={pulsarPhaseDeg}
							pulsarAxisEulerRad={pulsarAxisEulerRad}
							pulsarBeamLatitudeRad={pulsarBeamLatitudeRad}
							cameraDirection={cameraPosition}
							pulsarBeamAngleRad={pulsarBeamAngleRad}
							isAnimating={isAnimating}
							showPhaseTimeline={showPhaseTimeline}
							showPhaseTimelineLabel={showPhaseTimelineLabel}
							onPulsarPhaseChange={setPulsarPhaseDeg}
						/>
					</div>
					<div style={{ flex: 1, minWidth: 0, minHeight: 0, padding: "5px" }}>
						<label>
							<input
								type="checkbox"
								checked={showPhaseTimeline}
								onChange={() => setShowPhaseTimeline((prev) => !prev)}
							/>
							Show timeline
						</label>
						<label>
							<input
								type="checkbox"
								checked={showPhaseTimelineLabel}
								disabled={!showPhaseTimeline}
								onChange={() => setShowPhaseTimelineLabel((prev) => !prev)}
							/>
							Show phase label
						</label>
					</div>
					<div className="pulsar-plot" style={{ flex: 4 }}>
						<PulsarBeamIntensityPlotTime
							ref={pulsarPlotTimeRef}
							pulsarPhaseRad={pulsarPhaseRad}
							pulsarAxisEulerRad={pulsarAxisEulerRad}
							pulsarBeamLatitudeRad={pulsarBeamLatitudeRad}
							cameraDirection={cameraPosition}
							pulsarBeamAngleRad={pulsarBeamAngleRad}
							isAnimating={isAnimating}
						/>
					</div>
					<div style={{ flex: 1, minWidth: 0, minHeight: 0, padding: "5px" }}>
						<button
							type="button"
							onClick={() => {
								(pulsarPlotTimeRef.current?.resetPlot as () => void)();
							}}
						>
							Reset
						</button>
					</div>
					<div
						style={{
							flex: 4,
							width: "50%",
							minWidth: 0,
							minHeight: 0,
							padding: "5px",
						}}
					>
						<PulsarSkyView
							pulsarPhaseRad={pulsarPhaseRad}
							pulsarAxisEulerRad={pulsarAxisEulerRad}
							pulsarBeamLatitude={pulsarBeamLatitudeRad}
							cameraDirection={cameraPosition}
							pulsarBeamAngle={pulsarBeamAngleRad}
						/>
					</div>
				</div>
			</div>
		</>
	);
}
