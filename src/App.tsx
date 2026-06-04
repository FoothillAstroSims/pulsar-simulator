import { useEffect, useRef, useState } from "react";
import "./App.css";
import * as THREE from "three";
import type { PulsarModelRef } from "./components/PulsarModel";
import {
	isAnimatingDefault,
	PulsarModel,
	pulsarAxialTiltDefault,
	pulsarBeamAngleDefault,
	pulsarBeamLatitudeDefault,
	pulsarPeriodDefault,
	pulsarPhaseDefault,
} from "./components/PulsarModel";
import { PulsarParameterInput } from "./components/PulsarParameterInput";

export default function App() {
	const [isAnimating, setIsAnimating] = useState(isAnimatingDefault);
	const [pulsarPhase, setPulsarPhase] = useState(pulsarPhaseDefault);
	const [pulsarPeriod, setPulsarPeriod] = useState(pulsarPeriodDefault);
	const [pulsarAxialTilt, setPulsarAxialTilt] = useState(
		pulsarAxialTiltDefault,
	);
	const [pulsarBeamLatitude, setPulsarBeamLatitude] = useState(
		pulsarBeamLatitudeDefault,
	);
	const [pulsarBeamAngle, setPulsarBeamAngle] = useState(
		pulsarBeamAngleDefault,
	);
	const [pulsarModelCameraDirection, setPulsarModelCameraDirection] = useState(
		() => new THREE.Vector3(0, 0, 1),
	);

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
						console.log("Camera reset");
					}}
				>
					Reset camera
				</button>

				<button
					type="button"
					onClick={() => {
						setPulsarPhase(pulsarPhaseDefault);
						setPulsarPeriod(pulsarPeriodDefault);
						setPulsarAxialTilt(pulsarAxialTiltDefault);
						setPulsarBeamLatitude(pulsarBeamLatitudeDefault);
						setPulsarBeamAngle(pulsarBeamAngleDefault);
						console.log("Pulsar parameters reset");
					}}
				>
					Reset parameters
				</button>
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
						if (!isAnimating) {
							console.log(`Pulsar phase: ${e.target.value}`);
						}
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
						console.log(`Pulsar period: ${e.target.value}`);
					}}
				/>
				<br />
				<PulsarParameterInput
					name="pulsarAxialTilt"
					label="Pulsar axial tilt"
					min={0.0}
					max={Math.PI / 4}
					step={0.001}
					value={pulsarAxialTilt}
					onChange={(e) => {
						setPulsarAxialTilt(parseFloat(e.target.value));
						console.log(`Pulsar axial tilt: ${e.target.value}`);
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
						console.log(`Pulsar beam latitude: ${e.target.value}`);
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
						console.log(`Pulsar beam angle: ${e.target.value}`);
					}}
				/>
			</div>
			<div style={{ height: "80vh" }}>
				<PulsarModel
					ref={pulsarModelRef}
					isAnimating={isAnimating}
					pulsarPhase={pulsarPhase}
					pulsarPeriod={pulsarPeriod}
					pulsarAxialTilt={pulsarAxialTilt}
					pulsarBeamLatitude={pulsarBeamLatitude}
					pulsarBeamAngle={pulsarBeamAngle}
					onPulsarPhaseChange={setPulsarPhase}
					onCameraChange={setPulsarModelCameraDirection}
				/>
			</div>
		</>
	);
}
