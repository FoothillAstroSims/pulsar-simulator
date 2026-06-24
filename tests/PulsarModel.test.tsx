import { beforeEach, describe, expect, test } from "vitest";
import { render, RenderResult } from "vitest-browser-react";
import { PulsarModel } from "../src/components/PulsarModel";
import {
	CAMERA_POSITION_DEFAULT,
	PULSAR_AXIS_EULER_DEG_DEFAULT,
	PULSAR_BEAM_LATITUDE_DEG_DEFAULT,
	PULSAR_BEAM_RADIUS_DEFAULT,
	PULSAR_PERIOD_DEFAULT,
	PULSAR_PHASE_DEG_DEFAULT,
	pulsarAxisEulerDegToRad,
	pulsarBeamLatitudeDegToRad,
	pulsarPhaseDegToRad,
} from "../src/components/pulsar-config";

const pulsarModelProps = {
	pulsarPhase: pulsarPhaseDegToRad(PULSAR_PHASE_DEG_DEFAULT),
	pulsarPeriod: PULSAR_PERIOD_DEFAULT,
	pulsarAxisEuler: pulsarAxisEulerDegToRad(PULSAR_AXIS_EULER_DEG_DEFAULT),
	pulsarBeamLatitude: pulsarBeamLatitudeDegToRad(
		PULSAR_BEAM_LATITUDE_DEG_DEFAULT,
	),
	pulsarBeamRadius: PULSAR_BEAM_RADIUS_DEFAULT,
	cameraPosition: CAMERA_POSITION_DEFAULT,
	isAnimating: false,
	orbitControlsEnabled: false,
};

let mockRef: { current: Record<string, unknown> | null };
let screen: RenderResult;

beforeEach(async () => {
	mockRef = {
		current: null,
	};
	screen = await render(
		<div style={{ width: "100vw", height: "100vh" }}>
			<PulsarModel ref={mockRef} {...pulsarModelProps} />
		</div>,
	);
});

describe("Three.js pulsar model", () => {
	test("Pulsar model loads", async () => {
		await expect
			.poll(() => screen.container.querySelector("canvas"), {
				message: "No canvas element found",
			})
			.toBeTruthy();

		const canvas = screen.container.querySelector(
			"canvas",
		) as HTMLCanvasElement;
		// console.log(canvas);

		expect(canvas, "Canvas is not an HTML element").toBeInstanceOf(HTMLElement);
		expect(canvas.width, "Canvas width is 0").toBeGreaterThan(0);
		expect(canvas.height, "Canvas height is 0").toBeGreaterThan(0);

		expect(mockRef.current).not.toBeNull();
		expect(mockRef.current).toHaveProperty("getPixelRGBA");
		const getPixelRGBA = mockRef.current!.getPixelRGBA as (
			x: number,
			y: number,
		) => Uint8Array<ArrayBuffer> | undefined;

		[
			[0, 0],
			[canvas.clientWidth / 2, canvas.clientHeight / 2],
			[canvas.clientWidth - 1, canvas.clientHeight - 1],
		].forEach((coords) => {
			const [x, y] = coords;
			expect(
				getPixelRGBA(x, y)?.[3],
				`Canvas is transparent at (${x}, ${y}), check if model is rendering properly`,
			).toBeGreaterThan(0);
		});
	});
});
