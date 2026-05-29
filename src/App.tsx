import { useEffect, useRef, useState } from "react";
import "./App.css";
import type { PulsarViewRef } from "./components/PulsarView";
import {
	isAnimatingDefault,
	PulsarView,
	pulsarAxialTiltDefault,
	pulsarBeamAngleDefault,
	pulsarBeamLatitudeDefault,
	pulsarPeriodDefault,
} from "./components/PulsarView";

function App() {
	const [isAnimating, setIsAnimating] = useState(isAnimatingDefault);
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

	const pulsarViewRef = useRef<PulsarViewRef | null>(null);

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
				pulsarViewRef.current?.resetCamera();
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
		// TODO: Improve slider appearance: add labels, show value next to slider
		<>
			<div>
				<p>Test</p>
			</div>
			<div>
				<button type="button" onClick={() => setIsAnimating(!isAnimating)}>
					{isAnimating ? "Stop" : "Start"}
				</button>

				<button
					type="button"
					onClick={() => {
						pulsarViewRef.current?.resetCamera();
						console.log("Camera reset");
					}}
				>
					Reset camera
				</button>

				<button
					type="button"
					onClick={() => {
						setPulsarPeriod(pulsarPeriodDefault);
						setPulsarAxialTilt(pulsarAxialTiltDefault);
						setPulsarBeamLatitude(pulsarBeamLatitudeDefault);
						setPulsarBeamAngle(pulsarBeamAngleDefault);
						console.log("Pulsar parameters reset");
					}}
				>
					Reset to default parameters
				</button>

				<label htmlFor="pulsarPeriod">Pulsar period</label>
				<input
					name="pulsarPeriod"
					type="range"
					min={10.0}
					max={100.0}
					step={0.5}
					value={pulsarPeriod}
					onChange={(e) => {
						setPulsarPeriod(parseFloat(e.target.value));
						console.log(`Pulsar period: ${e.target.value}`);
					}}
				/>

				<label htmlFor="pulsarAxialTilt">Pulsar axial tilt</label>
				<input
					name="pulsarAxialTilt"
					type="range"
					min={0.0}
					max={Math.PI / 4}
					step={0.001}
					value={pulsarAxialTilt}
					onChange={(e) => {
						setPulsarAxialTilt(parseFloat(e.target.value));
						console.log(`Pulsar axial tilt: ${e.target.value}`);
					}}
				/>

				<label htmlFor="pulsarBeamLatitude">Pulsar beam latitude</label>
				<input
					name="pulsarBeamLatitude"
					type="range"
					min={0.0}
					max={Math.PI / 2}
					step={0.001}
					value={pulsarBeamLatitude}
					onChange={(e) => {
						setPulsarBeamLatitude(parseFloat(e.target.value));
						console.log(`Pulsar beam latitude: ${e.target.value}`);
					}}
				/>

				<label htmlFor="pulsarBeamAngle">Pulsar beam angle</label>
				<input
					name="pulsarBeamAngle"
					type="range"
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
				<PulsarView
					ref={pulsarViewRef}
					isAnimating={isAnimating}
					pulsarPeriod={pulsarPeriod}
					pulsarAxialTilt={pulsarAxialTilt}
					pulsarBeamLatitude={pulsarBeamLatitude}
					pulsarBeamAngle={pulsarBeamAngle}
				/>
			</div>
		</>
	);
}

export default App;
