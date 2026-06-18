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
	cameraPositionDefault,
	isAnimatingDefault,
	orbitControlsEnabledDefault,
	pulsarAxisEulerDefault,
	pulsarAxisEulerMax,
	pulsarAxisEulerMin,
	pulsarAxisEulerRescale,
	pulsarAxisEulerStep,
	pulsarBeamHeight,
	pulsarBeamLatitudeDefault,
	pulsarBeamLatitudeMax,
	pulsarBeamLatitudeMin,
	pulsarBeamLatitudeRescale,
	pulsarBeamLatitudeStep,
	pulsarBeamRadiusDefault,
	pulsarBeamRadiusMax,
	pulsarBeamRadiusMin,
	pulsarBeamRadiusStep,
	pulsarPeriodDefault,
	pulsarPeriodMax,
	pulsarPeriodMin,
	pulsarPeriodStep,
	pulsarPhaseDefault,
	pulsarPhaseMax,
	pulsarPhaseMin,
	pulsarPhaseRescale,
	pulsarPhaseStep,
	type Triplet,
} from "./components/utils-pulsar";
import { createKeyDownEventHandler } from "./utils";

export default function App() {
	const [pulsarPhase, setPulsarPhase] = useState(pulsarPhaseDefault);
	const [pulsarPeriod, setPulsarPeriod] = useState(pulsarPeriodDefault);
	const [pulsarBeamLatitude, setPulsarBeamLatitude] = useState(
		pulsarBeamLatitudeDefault,
	);
	const [pulsarAxisEuler, setPulsarAxisEuler] = useState<Triplet>(
		pulsarAxisEulerDefault,
	);
	const [pulsarBeamRadius, setPulsarBeamRadius] = useState(
		pulsarBeamRadiusDefault,
	);
	const [cameraPosition, setCameraPosition] = useState(cameraPositionDefault);
	const [isAnimating, setIsAnimating] = useState(isAnimatingDefault);
	const [orbitControlsEnabled, setOrbitControlsEnabled] = useState(
		orbitControlsEnabledDefault,
	);
	const [showPhaseTimeline, setShowPhaseTimeline] = useState(true);
	const [showPhaseTimelineLabel, setShowPhaseTimelineLabel] = useState(false);

	const pulsarPhaseRescaled = useMemo(
		() => pulsarPhaseRescale(pulsarPhase),
		[pulsarPhase],
	);
	const pulsarBeamLatitudeRescaled = useMemo(
		() => pulsarBeamLatitudeRescale(pulsarBeamLatitude),
		[pulsarBeamLatitude],
	);
	const pulsarAxisEulerRescaled = useMemo(
		() => pulsarAxisEulerRescale(pulsarAxisEuler),
		[pulsarAxisEuler],
	);
	const pulsarBeamAngle = useMemo(
		() => Math.atan(pulsarBeamRadius / pulsarBeamHeight),
		[pulsarBeamRadius],
	);

	const pulsarModelRef = useRef<Record<string, unknown> | null>(null);
	const pulsarPlotTimeRef = useRef<Record<string, unknown> | null>(null);

	const resetPulsarParameters = useCallback(() => {
		if (!isAnimating) {
			setPulsarPhase(pulsarPhaseDefault);
			setPulsarPeriod(pulsarPeriodDefault);
			setPulsarAxisEuler(pulsarAxisEulerDefault);
			setPulsarBeamLatitude(pulsarBeamLatitudeDefault);
			setPulsarBeamRadius(pulsarBeamRadiusDefault);
			// console.log("Pulsar parameters reset");
		}
	}, [isAnimating]);

	// Register keyboard event handlers
	useEffect(() => {
		// Start/stop animation
		const isAnimatingHandler = createKeyDownEventHandler(["p", "P"], () =>
			setIsAnimating((prev) => !prev),
		);
		window.addEventListener("keydown", isAnimatingHandler);

		// Reset camera
		const resetCameraHandler = createKeyDownEventHandler(["c", "C"], () =>
			(pulsarModelRef.current?.resetCamera as () => void)(),
		);
		window.addEventListener("keydown", resetCameraHandler);

		// Reset parameters
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
			<div>
				<p>Foothill AstroSims: Pulsar Beam Intensity</p>
			</div>

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
					label="Phase"
					min={pulsarPhaseMin}
					max={pulsarPhaseMax}
					step={pulsarPhaseStep}
					value={pulsarPhase}
					disabled={isAnimating}
					onChange={(e) => {
						if (e.target.value) setPulsarPhase(parseFloat(e.target.value));
						// if (!isAnimating) console.log(`Pulsar phase: ${e.target.value}`);
					}}
				/>{" "}
				<PulsarParameterInput
					name="pulsarPeriod"
					label="Period"
					min={pulsarPeriodMin}
					max={pulsarPeriodMax}
					step={pulsarPeriodStep}
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
					label="Inclination angle"
					min={pulsarAxisEulerMin[2]}
					max={pulsarAxisEulerMax[2]}
					step={pulsarAxisEulerStep}
					value={pulsarAxisEuler[2]}
					onChange={(e) => {
						if (e.target.value)
							setPulsarAxisEuler([
								pulsarAxisEuler[0],
								pulsarAxisEuler[1],
								parseFloat(e.target.value),
							]);
						// console.log(`Pulsar inclination (Euler Z): ${e.target.value}`);
					}}
				/>{" "}
				<PulsarParameterInput
					name="pulsarBeamLatitude"
					label="Beam latitude"
					min={pulsarBeamLatitudeMin}
					max={pulsarBeamLatitudeMax}
					step={pulsarBeamLatitudeStep}
					value={pulsarBeamLatitude}
					onChange={(e) => {
						if (e.target.value)
							setPulsarBeamLatitude(parseFloat(e.target.value));
						// console.log(`Pulsar beam latitude: ${e.target.value}`);
					}}
				/>{" "}
				<PulsarParameterInput
					name="pulsarBeamRadius"
					label="Beam angle"
					min={pulsarBeamRadiusMin}
					max={pulsarBeamRadiusMax}
					step={pulsarBeamRadiusStep}
					value={pulsarBeamRadius}
					onChange={(e) => {
						if (e.target.value) setPulsarBeamRadius(parseFloat(e.target.value));
						// console.log(`Pulsar beam angle: ${e.target.value}`);
					}}
				/>
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
						pulsarPhase={pulsarPhaseRescaled}
						pulsarPeriod={pulsarPeriod}
						pulsarAxisEuler={pulsarAxisEulerRescaled}
						pulsarBeamLatitude={pulsarBeamLatitudeRescaled}
						pulsarBeamRadius={pulsarBeamRadius}
						cameraPosition={cameraPosition}
						isAnimating={isAnimating}
						orbitControlsEnabled={orbitControlsEnabled}
						onPulsarPhaseChange={setPulsarPhase}
						onCameraPositionChange={setCameraPosition}
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
							pulsarPhase={pulsarPhase}
							pulsarAxisEuler={pulsarAxisEulerRescaled}
							pulsarBeamLatitude={pulsarBeamLatitudeRescaled}
							cameraDirection={cameraPosition}
							pulsarBeamAngle={pulsarBeamAngle}
							isAnimating={isAnimating}
							showPhaseTimeline={showPhaseTimeline}
							showPhaseTimelineLabel={showPhaseTimelineLabel}
							onPulsarPhaseChange={setPulsarPhase}
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
							pulsarPhase={pulsarPhase}
							pulsarAxisEuler={pulsarAxisEulerRescaled}
							pulsarBeamLatitude={pulsarBeamLatitudeRescaled}
							cameraDirection={cameraPosition}
							pulsarBeamAngle={pulsarBeamAngle}
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
					<div style={{ flex: 4, minWidth: 0, minHeight: 0, padding: "5px" }}>
						<PulsarSkyView
							pulsarPhase={pulsarPhaseRescaled}
							pulsarAxisEuler={pulsarAxisEulerRescaled}
							pulsarBeamLatitude={pulsarBeamLatitudeRescaled}
							cameraDirection={cameraPosition}
							pulsarBeamAngle={pulsarBeamAngle}
						/>
					</div>
				</div>
			</div>
		</>
	);
}
