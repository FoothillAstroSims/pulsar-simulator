import { describe, expect, expectTypeOf, test } from "vitest";
import { getPulsarBeamDirection } from "../src/components/pulsar-utils";
import { Triplet } from "../src/components/pulsar-config";

const tolerance = 0.01;
const pulsarDirectionCases: [
	{
		pulsarPhase: number;
		pulsarAxisInclination: Triplet;
		pulsarBeamLatitude: number;
	},
	Triplet,
	number,
][] = [
	[
		{ pulsarPhase: 0, pulsarAxisInclination: [0, 0, 0], pulsarBeamLatitude: 0 },
		[1, 0, 0],
		tolerance,
	],
	[
		{
			pulsarPhase: Math.PI / 2,
			pulsarAxisInclination: [0, 0, 0],
			pulsarBeamLatitude: 0,
		},
		[0, 0, -1],
		tolerance,
	],
	[
		{
			pulsarPhase: 0,
			pulsarAxisInclination: [0, 0, 0],
			pulsarBeamLatitude: Math.PI / 6,
		},
		[Math.cos(Math.PI / 6), -0.5, 0],
		tolerance,
	],
	[
		{
			pulsarPhase: 0,
			pulsarAxisInclination: [0, 0, Math.PI / 4],
			pulsarBeamLatitude: 0,
		},
		[Math.sqrt(2) / 2, Math.sqrt(2) / 2, 0],
		tolerance,
	],
	[
		{
			pulsarPhase: 0,
			pulsarAxisInclination: [Math.PI / 4, 0, Math.PI / 4],
			pulsarBeamLatitude: 0,
		},
		[Math.sqrt(2) / 2, 0.5, 0.5],
		tolerance,
	],
	[
		{
			pulsarPhase: 1,
			pulsarAxisInclination: [0, 0, 1],
			pulsarBeamLatitude: 1,
		},
		[0.55047, -0.70022, 0.45462],
		tolerance,
	],
];

describe("getPulsarBeamDirection", () => {
	test("getPulsarBeamDirection has proper typing", () => {
		expect(getPulsarBeamDirection.length).toEqual(3);
		expectTypeOf(getPulsarBeamDirection).parameter(0).toBeNumber();
		expectTypeOf(getPulsarBeamDirection).parameter(1).toEqualTypeOf<Triplet>();
		expectTypeOf(getPulsarBeamDirection).parameter(2).toBeNumber();
		expectTypeOf(getPulsarBeamDirection).returns.toEqualTypeOf<Triplet>();
	});

	test.each(pulsarDirectionCases)(
		"Pulsar direction formula is correct for %o",
		(params, expected, tolerance) => {
			const { pulsarPhase, pulsarAxisInclination, pulsarBeamLatitude } = params;
			const dir = getPulsarBeamDirection(
				pulsarPhase,
				pulsarAxisInclination,
				pulsarBeamLatitude,
			);
			console.log(dir);
			expect(Math.abs(dir[0] - expected[0])).toBeLessThan(tolerance);
			expect(Math.abs(dir[1] - expected[1])).toBeLessThan(tolerance);
			expect(Math.abs(dir[2] - expected[2])).toBeLessThan(tolerance);
		},
	);
});
