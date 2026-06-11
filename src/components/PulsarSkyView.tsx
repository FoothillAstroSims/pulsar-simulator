import { useEffect, useRef } from "react";
import { getPulsarBeamDirection, getPulsarBeamIntensity } from "./utils-pulsar";

const pulseColorRGB = "255, 255, 0"; // Pulse color RGB
const skyColorRGB = "135, 206, 235"; // Sky color RGB

// Draw pulse using a canvas context element
function drawPulse(
	ctx: CanvasRenderingContext2D,
	pulseX: number,
	pulseY: number,
	pulseRadius: number,
	pulseColor: string,
) {
	ctx.fillStyle = `rgba(${skyColorRGB})`;
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	const pulseGradient = ctx.createRadialGradient(
		pulseX,
		pulseY,
		0.01 * pulseRadius,
		pulseX,
		pulseY,
		pulseRadius,
	);
	pulseGradient.addColorStop(0, pulseColor);
	pulseGradient.addColorStop(1, `rgba(${skyColorRGB}, 0)`);

	ctx.beginPath();
	ctx.arc(pulseX, pulseY, pulseRadius, 0, 2 * Math.PI);
	ctx.fillStyle = pulseGradient;
	ctx.fill();
}

// "Sky view" of the pulsar - what observers far away from the pulsar see
export function PulsarSkyView(props: {
	pulsarPhase: number; // See PulsarModelProps in PulsarModel.tsx for descriptions of the pulsar-related parameters
	pulsarAxisEuler: [number, number, number];
	pulsarBeamLatitude: number;
	cameraDirection: [number, number, number];
	pulsarBeamAngle: number;
}) {
	const {
		pulsarPhase,
		pulsarAxisEuler,
		pulsarBeamLatitude,
		cameraDirection,
		pulsarBeamAngle,
	} = props;

	const canvasRef = useRef<HTMLCanvasElement | null>(null); // Canvas element ref

	// Display sky view pulse after each pulsar parameter update
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d")!;
		const { width, height } = canvas;
		const pulseX = width / 2;
		const pulseY = height / 2;
		const pulseRadius = Math.min(width / 2.5, height / 2.5);
		const pulseColorOpacity = getPulsarBeamIntensity(
			getPulsarBeamDirection(pulsarPhase, pulsarAxisEuler, pulsarBeamLatitude),
			cameraDirection,
			pulsarBeamAngle,
		); // Opacity of the gradient is equal to the beam intensity: 100% = full intensity, 0% = no radiation detected
		const pulseColor = `rgba(${pulseColorRGB}, ${pulseColorOpacity})`;

		drawPulse(ctx, pulseX, pulseY, pulseRadius, pulseColor);
	}, [
		pulsarPhase,
		pulsarAxisEuler,
		pulsarBeamLatitude,
		cameraDirection,
		pulsarBeamAngle,
	]);

	return <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />;
}
