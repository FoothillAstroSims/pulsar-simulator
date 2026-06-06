import { describe, expect, expectTypeOf, test } from "vitest";
import * as utils from "../src/utils";

const tolerance = 0.01;
const pulsarDirectionCases: [
	utils.PulsarBeamDirectionParams,
	[number, number, number],
	number,
][] = [
	[
		{ pulsarPhase: 0, pulsarAxisInclination: [0, 0, 0], pulsarBeamLatitude: 0 },
		[-1, 0, 0],
		tolerance,
	],
	[
		{
			pulsarPhase: Math.PI / 2,
			pulsarAxisInclination: [0, 0, 0],
			pulsarBeamLatitude: 0,
		},
		[0, 0, 1],
		tolerance,
	],
	[
		{
			pulsarPhase: 0,
			pulsarAxisInclination: [0, 0, 0],
			pulsarBeamLatitude: Math.PI / 6,
		},
		[-Math.cos(Math.PI / 6), -0.5, 0],
		tolerance,
	],
	[
		{
			pulsarPhase: 0,
			pulsarAxisInclination: [0, 0, Math.PI / 4],
			pulsarBeamLatitude: 0,
		},
		[-Math.sqrt(2) / 2, -Math.sqrt(2) / 2, 0],
		tolerance,
	],
	[
		{
			pulsarPhase: 0,
			pulsarAxisInclination: [Math.PI / 4, 0, Math.PI / 4],
			pulsarBeamLatitude: 0,
		},
		[-Math.sqrt(2) / 2, -0.5, -0.5],
		tolerance,
	],
	[
		{
			pulsarPhase: 1,
			pulsarAxisInclination: [1, 1, 1],
			pulsarBeamLatitude: 1,
		},
		[0.680, -0.195, -0.707],
		tolerance,
	],
];

describe("pulsarBeamDirection", () => {
	test("pulsarBeamDirection has proper typing", () => {
		expect(utils.pulsarBeamDirection.length).toEqual(3);
		expectTypeOf(utils.pulsarBeamDirection).parameter(0).toBeNumber();
		expectTypeOf(utils.pulsarBeamDirection)
			.parameter(1)
			.toEqualTypeOf<[number, number, number]>();
		expectTypeOf(utils.pulsarBeamDirection).parameter(2).toBeNumber();
		expectTypeOf(utils.pulsarBeamDirection).returns.toEqualTypeOf<
			[number, number, number]
		>();
	});

	test.each(pulsarDirectionCases)(
		"Pulsar direction formula is correct for %o",
		(a, b, expected) => {
			const { pulsarPhase, pulsarAxisInclination, pulsarBeamLatitude } = a;
			const dir = utils.pulsarBeamDirection(
				pulsarPhase,
				pulsarAxisInclination,
				pulsarBeamLatitude,
			);

			expect(Math.abs(dir[0] - b[0])).toBeLessThan(expected);
			expect(Math.abs(dir[1] - b[1])).toBeLessThan(expected);
			expect(Math.abs(dir[2] - b[2])).toBeLessThan(expected);
		},
	);
});
