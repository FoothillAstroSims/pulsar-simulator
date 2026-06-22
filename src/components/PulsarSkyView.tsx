import { useCallback, useEffect, useRef } from "react";
import { type Triplet } from "./pulsar-config";
import { getPulsarBeamDirection, getPulsarBeamIntensity } from "./pulsar-utils";

const pulseColorRGB = "255, 255, 0"; // Pulse color RGB
const skyColorRGB = "135, 206, 235"; // Sky color RGB

/**
 * "Sky view" of the pulsar i.e. just the beam pulse and not the pulsar itself, to simulate what an observer far away would be able to detect
 */
export function PulsarSkyView(props: {
	pulsarPhaseRad: number; // See PulsarModelProps in PulsarModel.tsx for descriptions of the pulsar-related parameters
	pulsarAxisEulerRad: Triplet;
	pulsarBeamLatitude: number;
	cameraDirection: Triplet;
	pulsarBeamAngle: number;
}) {
	const {
		pulsarPhaseRad: pulsarPhase,
		pulsarAxisEulerRad: pulsarAxisEuler,
		pulsarBeamLatitude,
		cameraDirection,
		pulsarBeamAngle,
	} = props;

	const containerRef = useRef<HTMLDivElement | null>(null); // Container div element ref
	const canvasRef = useRef<HTMLCanvasElement | null>(null); // Canvas element ref

	// Draw beam pulse in an HTML canvas element
	const drawContent = useCallback(
		(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
			const { width, height } = canvas;
			const pulseX = width / 2;
			const pulseY = height / 2;
			const pulseRadius = Math.min(width / 2.5, height / 2.5);
			const pulseColorOpacity = getPulsarBeamIntensity(
				getPulsarBeamDirection(
					pulsarPhase,
					pulsarAxisEuler,
					pulsarBeamLatitude,
				),
				cameraDirection,
				pulsarBeamAngle,
			); // Opacity of the gradient is equal to the beam intensity: 100% = full intensity, 0% = no radiation detected
			const pulseColor = `rgba(${pulseColorRGB}, ${pulseColorOpacity})`;

			// Sky background
			ctx.fillStyle = `rgba(${skyColorRGB})`;
			ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

			// Gradient that smoothly blends into the background
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

			// Beam pulse
			ctx.beginPath();
			ctx.arc(pulseX, pulseY, pulseRadius, 0, 2 * Math.PI);
			ctx.fillStyle = pulseGradient;
			ctx.fill();
		},
		[
			pulsarPhase,
			pulsarAxisEuler,
			pulsarBeamLatitude,
			cameraDirection,
			pulsarBeamAngle,
		],
	);

	// Display sky view pulse after each pulsar parameter update
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d")!;
		drawContent(canvas, ctx);
	}, [drawContent]);

	// Handle window/parent div resizing
	useEffect(() => {
		const container = containerRef.current;
		const canvas = canvasRef.current;

		if (!container || !canvas) return;

		const ctx = canvas.getContext("2d")!;

		const resizeObserver = new ResizeObserver(() => {
			const containerRect = container.getBoundingClientRect(); // Get the container div

			// Set the canvas dimensions equal to the container dimensions
			canvas.width = containerRect.width;
			canvas.height = containerRect.height;

			// Redraw the canvas (note that the main canvas drawing effect hook will not fire if the window is resized due to it not depending on DOM parameters)
			drawContent(canvas, ctx);
		});
		resizeObserver.observe(container); // Register the resizing observer onto the container div
	}, [drawContent]);

	return (
		<div
			ref={containerRef}
			className="pulsar-sky-view"
			style={{ width: "100%", height: "100%" }}
		>
			<canvas ref={canvasRef} />
		</div>
	);
}
