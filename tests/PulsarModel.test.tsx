import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { PulsarModel, PulsarModelProps } from "../src/components/PulsarModel";
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

const pulsarModelProps: PulsarModelProps = {
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

describe("Three.js pulsar model", () => {
	test("Pulsar model loads", async () => {
		const screen = await render(
			<div style={{ width: "1000px", height: "1000px", minHeight: "1000px" }}>
				<PulsarModel {...pulsarModelProps} />
			</div>,
		);

		await expect
			.poll(() => screen.container.querySelector("canvas"), {
				message: "No canvas element found",
			})
			.toBeTruthy();

		const canvas = screen.container.querySelector(
			"canvas",
		) as HTMLCanvasElement;
		expect(canvas, "Canvas is not an HTML element").toBeInstanceOf(HTMLElement);
		expect(canvas.width, "Canvas width is 0").toBeGreaterThan(0);
		expect(canvas.height, "Canvas height is 0").toBeGreaterThan(0);
	});
});
