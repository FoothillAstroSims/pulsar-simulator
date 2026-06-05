import { useEffect, useRef, useState } from "react";
import "./App.css";
import type { PulsarModelRef } from "./components/PulsarModel";
import {
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

const pulsarAxisInclinationDefault: [number, number, number] = [
	pulsarAxisInclinationXDefault,
	pulsarAxisInclinationYDefault,
	pulsarAxisInclinationZDefault,
];

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
	const [isAnimating, setIsAnimating] = useState(isAnimatingDefault);
	const [orbitControlsEnabled, setOrbitControlsEnabled] = useState(
		orbitControlsEnabledDefault,
	);
	const [pulsarModelCameraDirection, setPulsarModelCameraDirection] = useState([
		0, 0, 0,
	]);

	const pulsarModelRef = useRef<PulsarModelRef | null>(null);

	// Register keyboard event handlers
	useEffect(() => {
		// Start/stop animation
		const isAnimatingHandler = (e: KeyboardEvent) => {
			const target = e.target;
			if (
				target &&
				target instanceof HTMLInputElement &&
				(target.type === "text" || target.type === "textarea")
			)
				return;

			if (e.key === "p" || e.key === "P") {
				setIsAnimating((prev) => !prev);
			}
		};
		window.addEventListener("keydown", isAnimatingHandler);

		// Reset camera
		const resetCameraHandler = (e: KeyboardEvent) => {
			const target = e.target;
			if (
				target &&
				target instanceof HTMLInputElement &&
				(target.type === "text" || target.type === "textarea")
			)
				return;

			if (e.key === "r" || e.key === "R") {
				pulsarModelRef.current?.resetCamera();
			}
		};
		window.addEventListener("keydown", resetCameraHandler);

		return () => {
			window.removeEventListener("keydown", isAnimatingHandler);
			window.removeEventListener("keydown", resetCameraHandler);
		};
	}, []);

	return (
		// TODO: Implement pulsar beam intensity graph, and hook it up to sync with the model
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
					onClick={() => {
						if (!isAnimating) {
							setPulsarPhase(pulsarPhaseDefault);
							setPulsarPeriod(pulsarPeriodDefault);
							setPulsarAxisInclination(pulsarAxisInclinationDefault);
							setPulsarBeamLatitude(pulsarBeamLatitudeDefault);
							setPulsarBeamAngle(pulsarBeamAngleDefault);
							// console.log("Pulsar parameters reset");
						}
					}}
				>
					Reset parameters
				</button>
				<label>
					<input
						type="checkbox"
						onClick={() => setOrbitControlsEnabled(!orbitControlsEnabled)}
					/>
					Toggle camera control
				</label>
				<br />
				<PulsarParameterInput
					name="pulsarPhase"
					label="Pulsar phase"
					min={0.0}
					max={2 * Math.PI}
					step={0.001}
					value={pulsarPhase}
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
					min={10.0}
					max={100.0}
					step={0.5}
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
					min={0}
					max={Math.PI}
					step={0.001}
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
					min={0}
					max={Math.PI}
					step={0.001}
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
					min={0}
					max={Math.PI}
					step={0.001}
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
					min={0.0}
					max={Math.PI / 2}
					step={0.001}
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
					min={0.0}
					max={Math.PI / 12}
					step={0.001}
					value={pulsarBeamAngle}
					onChange={(e) => {
						setPulsarBeamAngle(parseFloat(e.target.value));
						// console.log(`Pulsar beam angle: ${e.target.value}`);
					}}
				/>
			</div>
			<div style={{ height: "80vh" }}>
				<PulsarModel
					ref={pulsarModelRef}
					pulsarPhase={pulsarPhase}
					pulsarPeriod={pulsarPeriod}
					pulsarAxisInclination={pulsarAxisInclination}
					pulsarBeamLatitude={pulsarBeamLatitude}
					pulsarBeamAngle={pulsarBeamAngle}
					isAnimating={isAnimating}
					orbitControlsEnabled={orbitControlsEnabled}
					onPulsarPhaseChange={setPulsarPhase}
					onPulsarAxisChange={setPulsarAxisInclination}
					onCameraChange={setPulsarModelCameraDirection}
				/>
			</div>
		</>
	);
}
