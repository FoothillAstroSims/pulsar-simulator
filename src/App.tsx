import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import {
	PulsarBeamIntensityPlotPhase,
	pulsarPhaseStep,
	pulsarPhaseMin,
	pulsarPhaseMax,
} from "./components/PulsarBeamIntensityPlot";
import type { PulsarModelRef } from "./components/PulsarModel";
import {
	cameraPositionXDefault,
	cameraPositionYDefault,
	cameraPositionZDefault,
	isAnimatingDefault,
	orbitControlsEnabledDefault,
	PulsarModel,
	pulsarAxisInclinationXDefault,
	pulsarAxisInclinationYDefault,
	pulsarAxisInclinationZDefault,
	pulsarBeamAngleDefault,
	pulsarBeamLatitudeDefault,
	pulsarPeriodDefault,
	pulsarPhaseDefault,
} from "./components/PulsarModel";
import { PulsarParameterInput } from "./components/PulsarParameterInput";
import { getDecimalPlaces, createKeyDownEventHandler } from "./utils";

const pulsarAxisInclinationDefault: [number, number, number] = [
	pulsarAxisInclinationXDefault,
	pulsarAxisInclinationYDefault,
	pulsarAxisInclinationZDefault,
];
const cameraPositionDefault: [number, number, number] = [
	cameraPositionXDefault,
	cameraPositionYDefault,
	cameraPositionZDefault,
];

const pulsarPeriodStep = 0.01;
const pulsarPeriodMin = 1.0;
const pulsarPeriodMax = 10.0;

const pulsarAxisInclinationStep = [0.001, 0.001, 0.001];
const pulsarAxisInclinationMin = [0.0, 0.0, 0.0];
const pulsarAxisInclinationMax = [Math.PI, Math.PI, Math.PI];

const pulsarBeamLatitudeStep = 0.001;
const pulsarBeamLatitudeMin = 0.0;
const pulsarBeamLatitudeMax = Math.PI / 2;

const pulsarBeamAngleStep = 0.001;
const pulsarBeamAngleMin = 0.0;
const pulsarBeamAngleMax = Math.PI / 8;

export default function App() {
	const [pulsarPhase, setPulsarPhase] = useState(pulsarPhaseDefault);
	const [pulsarPeriod, setPulsarPeriod] = useState(pulsarPeriodDefault);
	const [pulsarBeamLatitude, setPulsarBeamLatitude] = useState(
		pulsarBeamLatitudeDefault,
	);
	const [pulsarAxisInclination, setPulsarAxisInclination] = useState<
		[number, number, number]
	>(pulsarAxisInclinationDefault);
	const [pulsarBeamAngle, setPulsarBeamAngle] = useState(
		pulsarBeamAngleDefault,
	);
	const [pulsarBeamDirection, setPulsarBeamDirection] = useState<
		[number, number, number]
	>([0, 0, 0]);
	const [cameraPosition, setCameraPosition] = useState(cameraPositionDefault);
	const [isAnimating, setIsAnimating] = useState(isAnimatingDefault);
	const [orbitControlsEnabled, setOrbitControlsEnabled] = useState(
		orbitControlsEnabledDefault,
	);
	const pulsarModelRef = useRef<PulsarModelRef | null>(null);

	const resetPulsarParameters = useCallback(() => {
		if (!isAnimating) {
			setPulsarPhase(pulsarPhaseDefault);
			setPulsarPeriod(pulsarPeriodDefault);
			setPulsarAxisInclination(pulsarAxisInclinationDefault);
			setPulsarBeamLatitude(pulsarBeamLatitudeDefault);
			setPulsarBeamAngle(pulsarBeamAngleDefault);
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
		const resetCameraHandler = createKeyDownEventHandler(["c", "C"], () => {
			pulsarModelRef.current?.resetCamera();
		});
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
				<p>Test</p>
			</div>
			<div id="pulsarParameters">
				<input type="text" />
				<button type="button" onClick={() => setIsAnimating(!isAnimating)}>
					{isAnimating ? "Stop" : "Start"}
				</button>
				<button
					type="button"
					onClick={() => {
						pulsarModelRef.current?.resetCamera();
						// console.log("Camera reset");
					}}
				>
					Reset camera
				</button>
				<button
					type="button"
					disabled={isAnimating}
					onClick={() => resetPulsarParameters()}
				>
					Reset parameters
				</button>
				<label>
					<input
						type="checkbox"
						checked={!orbitControlsEnabled}
						onChange={() => setOrbitControlsEnabled(!orbitControlsEnabled)}
					/>
					Lock camera
				</label>
				<br />
				<PulsarParameterInput
					name="pulsarPhase"
					label="Pulsar phase"
					min={pulsarPhaseMin}
					max={pulsarPhaseMax}
					step={pulsarPhaseStep}
					value={parseFloat(
						pulsarPhase.toFixed(getDecimalPlaces(pulsarPhaseStep)),
					)}
					disabled={isAnimating}
					onChange={(e) => {
						setPulsarPhase(parseFloat(e.target.value));
						// if (!isAnimating) console.log(`Pulsar phase: ${e.target.value}`);
					}}
				/>
				<br />
				<PulsarParameterInput
					name="pulsarPeriod"
					label="Pulsar period"
					min={pulsarPeriodMin}
					max={pulsarPeriodMax}
					step={pulsarPeriodStep}
					value={pulsarPeriod}
					onChange={(e) => {
						setPulsarPeriod(parseFloat(e.target.value));
						// console.log(`Pulsar period: ${e.target.value}`);
					}}
				/>
				<br />
				Pulsar inclination{" "}
				<PulsarParameterInput
					name="pulsarAxisInclinationX"
					label="X"
					min={pulsarAxisInclinationMin[0]}
					max={pulsarAxisInclinationMax[0]}
					step={pulsarAxisInclinationStep[0]}
					value={pulsarAxisInclination[0]}
					onChange={(e) => {
						setPulsarAxisInclination([
							parseFloat(e.target.value),
							pulsarAxisInclination[1],
							pulsarAxisInclination[2],
						]);
						// console.log(`Pulsar axis inclination X: ${e.target.value}`);
					}}
				/>
				<PulsarParameterInput
					name="pulsarAxisInclinationY"
					label="Y"
					min={pulsarAxisInclinationMin[1]}
					max={pulsarAxisInclinationMax[1]}
					step={pulsarAxisInclinationStep[1]}
					value={pulsarAxisInclination[1]}
					onChange={(e) => {
						setPulsarAxisInclination([
							pulsarAxisInclination[0],
							parseFloat(e.target.value),
							pulsarAxisInclination[2],
						]);
						// console.log(`Pulsar axis inclination Y: ${e.target.value}`);
					}}
				/>
				<PulsarParameterInput
					name="pulsarInclinationZ"
					label="Z"
					min={pulsarAxisInclinationMin[2]}
					max={pulsarAxisInclinationMax[2]}
					step={pulsarAxisInclinationStep[2]}
					value={pulsarAxisInclination[2]}
					onChange={(e) => {
						setPulsarAxisInclination([
							pulsarAxisInclination[0],
							pulsarAxisInclination[1],
							parseFloat(e.target.value),
						]);
						// console.log(`Pulsar axis inclination Z: ${e.target.value}`);
					}}
				/>
				<br />
				<PulsarParameterInput
					name="pulsarBeamLatitude"
					label="Pulsar beam latitude"
					min={pulsarBeamLatitudeMin}
					max={pulsarBeamLatitudeMax}
					step={pulsarBeamLatitudeStep}
					value={pulsarBeamLatitude}
					onChange={(e) => {
						setPulsarBeamLatitude(parseFloat(e.target.value));
						// console.log(`Pulsar beam latitude: ${e.target.value}`);
					}}
				/>
				<br />
				<PulsarParameterInput
					name="pulsarBeamAngle"
					label="Pulsar beam angle"
					min={pulsarBeamAngleMin}
					max={pulsarBeamAngleMax}
					step={pulsarBeamAngleStep}
					value={pulsarBeamAngle}
					onChange={(e) => {
						setPulsarBeamAngle(parseFloat(e.target.value));
						// console.log(`Pulsar beam angle: ${e.target.value}`);
					}}
				/>
			</div>

			<div style={{ height: "75vh", display: "flex" }}>
				<div style={{ width: "50%", flex: 1 }}>
					<PulsarModel
						ref={pulsarModelRef}
						pulsarPhase={pulsarPhase}
						pulsarPeriod={pulsarPeriod}
						pulsarAxisInclination={pulsarAxisInclination}
						pulsarBeamLatitude={pulsarBeamLatitude}
						pulsarBeamAngle={pulsarBeamAngle}
						cameraPosition={cameraPosition}
						isAnimating={isAnimating}
						orbitControlsEnabled={orbitControlsEnabled}
						onPulsarPhaseChange={setPulsarPhase}
						onPulsarBeamDirectionChange={setPulsarBeamDirection}
						onCameraPositionChange={setCameraPosition}
					/>
				</div>
				<div style={{ flex: 1 }}>
					<PulsarBeamIntensityPlotPhase
						pulsarPhase={pulsarPhase}
						pulsarAxisInclination={pulsarAxisInclination}
						pulsarBeamLatitude={pulsarBeamLatitude}
						cameraDirection={cameraPosition}
						pulsarBeamAngle={pulsarBeamAngle}
						isAnimating={isAnimating}
						onPulsarPhaseChange={setPulsarPhase}
					/>
				</div>
			</div>
		</>
	);
}
