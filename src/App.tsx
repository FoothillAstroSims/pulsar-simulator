import PulsarView from "./components/PulsarView";
import "./App.css";
import { useEffect, useState } from "react";

function App() {
	const [isAnimating, setIsAnimating] = useState(true);
	const [pulsarRotationRate, setPulsarRotationRate] = useState(0.01);

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
				<label htmlFor="pulsarRotationRate">Rotation rate</label>
				<input
					name="pulsarRotationRate"
					type="range"
					min={0}
					max={0.02}
					step={0.0001}
					value={pulsarRotationRate}
					onChange={(e) => {
						setPulsarRotationRate(parseFloat(e.target.value));
						console.log(e.target.value);
					}}
				/>
				<input type="range" />
			</div>
			<div style={{ height: "80vh", width: "100vw" }}>
				<PulsarView
					isAnimating={isAnimating}
					pulsarRotationRate={pulsarRotationRate}
				/>
			</div>
		</>
	);
}

export default App;
