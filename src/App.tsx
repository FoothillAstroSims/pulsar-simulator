import { useEffect, useState } from "react";
import "./App.css";
import {
	PulsarView,
	pulsarAxialTiltDefault,
	pulsarBeamLatitudeDefault,
	pulsarPeriodDefault,
} from "./components/PulsarView";

function App() {
	const [isAnimating, setIsAnimating] = useState(true);
	const [pulsarPeriod, setPulsarPeriod] = useState(pulsarPeriodDefault);
	const [pulsarAxialTilt, setPulsarAxialTilt] = useState(
		pulsarAxialTiltDefault,
	);
	const [pulsarBeamLatitude, setPulsarBeamLatitude] = useState(
		pulsarBeamLatitudeDefault,
	);

	// Register play/pause animation keyboard event handler
	useEffect(() => {
		const isAnimatingHandler = (e: KeyboardEvent) => {
			const target = e.target as HTMLElement | null;
			if (target && target.tagName === "TEXTAREA") return;

			if (e.key === "p" || e.key === "P") {
				setIsAnimating((prev) => !prev);
			}
		};

		window.addEventListener("keydown", isAnimatingHandler);
		return () => window.removeEventListener("keydown", isAnimatingHandler);
	}, []);

	return (
		<>
			<div>
				<p>Test</p>
			</div>
			<div>
				<button type="button" onClick={() => setIsAnimating(!isAnimating)}>
					{isAnimating ? "Pause" : "Play"}
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
						console.log(e.target.value);
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
					}}
				/>
			</div>
			<div style={{ height: "80vh", width: "100vw" }}>
				<PulsarView
					isAnimating={isAnimating}
					pulsarPeriod={pulsarPeriod}
					pulsarAxialTilt={pulsarAxialTilt}
					pulsarBeamLatitude={pulsarBeamLatitude}
				/>
			</div>
		</>
	);
}

export default App;
