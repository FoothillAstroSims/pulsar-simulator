import { describe, expect, expectTypeOf, test } from "vitest";
import * as utils from "../src/utils";

const tolerance = 0.001;
const pulsarDirectionCases: [
	utils.PulsarBeamDirectionParams,
	[number, number, number],
	number,
][] = [
	[
		{ pulsarPhase: 0, pulsarAxialTilt: 0, pulsarBeamLatitude: 0 },
		[-1, 0, 0],
		tolerance,
	],
	[
		{ pulsarPhase: Math.PI / 2, pulsarAxialTilt: 0, pulsarBeamLatitude: 0 },
		[0, 0, 1],
		tolerance,
	],
	[
		{ pulsarPhase: 0, pulsarAxialTilt: Math.PI / 6, pulsarBeamLatitude: 0 },
		[-0.866025, -0.5, 0],
		tolerance,
	],
	[
		{ pulsarPhase: 0, pulsarAxialTilt: 0, pulsarBeamLatitude: Math.PI / 6 },
		[-0.866025, 0.5, 0],
		tolerance,
	],
	[
		{
			pulsarPhase: 0,
			pulsarAxialTilt: Math.PI / 6,
			pulsarBeamLatitude: Math.PI / 6,
		},
		[-1, 0, 0],
		tolerance,
	],
	[
		{
			pulsarPhase: 1,
			pulsarAxialTilt: 0.5,
			pulsarBeamLatitude: 0.5,
		},
		[-0.645963, 0.193411, 0.73846],
		tolerance,
	],
];

describe("pulsarBeamDirection", () => {
	test("pulsarBeamDirection has proper typing", () => {
		expect(utils.pulsarBeamDirection.length).toEqual(3);
		expectTypeOf(utils.pulsarBeamDirection).parameter(0).toBeNumber();
		expectTypeOf(utils.pulsarBeamDirection).parameter(1).toBeNumber();
		expectTypeOf(utils.pulsarBeamDirection).parameter(2).toBeNumber();
		expectTypeOf(utils.pulsarBeamDirection).returns.toEqualTypeOf<
			[number, number, number]
		>();
	});

	test.each(pulsarDirectionCases)(
		"Pulsar direction formula is correct for %o",
		(a, b, expected) => {
			const { pulsarPhase, pulsarAxialTilt, pulsarBeamLatitude } = a;
			const dir = utils.pulsarBeamDirection(
				pulsarPhase,
				pulsarAxialTilt,
				pulsarBeamLatitude,
			);

			expect(Math.abs(dir[0] - b[0])).toBeLessThan(expected);
			expect(Math.abs(dir[1] - b[1])).toBeLessThan(expected);
			expect(Math.abs(dir[2] - b[2])).toBeLessThan(expected);
		},
	);
});
