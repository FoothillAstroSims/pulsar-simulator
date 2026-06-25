import { beforeEach, describe, expect, test } from "vitest";
import { render, RenderResult } from "vitest-browser-react";
import { PulsarModel, PulsarModelProps } from "../src/components/PulsarModel";
import {
	CAMERA_POSITION_DEFAULT,
	PULSAR_AXIS_EULER_DEG_DEFAULT,
	PULSAR_BEAM_ANGULAR_DIAMETER_DEG_DEFAULT,
	PULSAR_BEAM_LATITUDE_DEG_DEFAULT,
	PULSAR_PERIOD_DEFAULT,
	PULSAR_PHASE_DEG_DEFAULT,
	pulsarAxisEulerDegToRad,
	pulsarBeamAngularDiameterDegToRad,
	pulsarBeamLatitudeDegToRad,
	pulsarPhaseDegToRad,
} from "../src/components/pulsar-config";

function renderPulsarModel(
	pulsarModelProps: PulsarModelProps & Record<string, unknown>,
	mockRef: { current: Record<string, unknown> | null } = { current: null },
) {
	return (
		<div style={{ width: "100vw", height: "100vh" }}>
			<PulsarModel ref={mockRef} {...pulsarModelProps} />
		</div>
	);
}

let pulsarModelProps: PulsarModelProps & Record<string, unknown>;
let mockRef: { current: Record<string, unknown> | null };
let screen: RenderResult;

beforeEach(async () => {
	pulsarModelProps = {
		pulsarPhase: pulsarPhaseDegToRad(PULSAR_PHASE_DEG_DEFAULT),
		pulsarPeriod: PULSAR_PERIOD_DEFAULT,
		pulsarAxisEuler: pulsarAxisEulerDegToRad(PULSAR_AXIS_EULER_DEG_DEFAULT),
		pulsarBeamLatitude: pulsarBeamLatitudeDegToRad(
			PULSAR_BEAM_LATITUDE_DEG_DEFAULT,
		),
		pulsarBeamAngularDiameter: pulsarBeamAngularDiameterDegToRad(
			PULSAR_BEAM_ANGULAR_DIAMETER_DEG_DEFAULT,
		),
		cameraPosition: CAMERA_POSITION_DEFAULT,
		isAnimating: false,
		orbitControlsEnabled: false,
	};
	mockRef = {
		current: null,
	};
	screen = await render(renderPulsarModel(pulsarModelProps, mockRef));
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

	test("Initial pulsar model renders correctly", async () => {
		await expect(
			screen.baseElement,
			"Initial pulsar model render does not match screenshot",
		).toMatchScreenshot("pulsar-model-init");
	});

	test.each([
		{ name: "0", phase: 0 },
		{ name: "pi_4", phase: Math.PI / 4 },
		{ name: "pi_2", phase: Math.PI / 2 },
		{ name: "pi", phase: Math.PI },
		{ name: "7pi_4", phase: (7 * Math.PI) / 4 },
		{ name: "2pi", phase: 2 * Math.PI },
		{ name: "9pi_4", phase: 2 * Math.PI + Math.PI / 4 },
		{ name: "neg_pi_4", phase: -Math.PI / 4 },
	])(
		"Pulsar model for phase $name = $phase renders correctly",
		async ({ name, phase }) => {
			const props = { ...pulsarModelProps };
			props.pulsarPhase = phase;

			await screen.rerender(renderPulsarModel(props));

			await expect(
				screen.baseElement,
				`Pulsar model for phase ${name} = ${phase} does not match screenshot`,
			).toMatchScreenshot(`pulsar-model-phase-${name}`);
		},
	);
});
