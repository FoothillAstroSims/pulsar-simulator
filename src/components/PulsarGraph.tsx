import Plotly from "plotly.js-dist-min";
import factoryImport from "react-plotly.js/factory";

const createPlotlyComponent =
	(factoryImport as unknown as { default?: typeof factoryImport }).default ??
	factoryImport;

import { linspace } from "./utils";

const Plot = createPlotlyComponent(Plotly);

const omega = Math.PI / 24;
const cameraAngle = Math.PI / 2;
const xAxis = linspace(0, 100 * Math.PI, 0.001);
const yAxis = xAxis.map((x) => {
	return Math.abs(cameraAngle - (x % Math.PI)) <= omega
		? Math.cos(((Math.PI / 2) * (cameraAngle - x)) / omega) ** 2
		: 0;
});

export default function PulsarGraph() {
	return (
		<Plot
			data={[
				{
					x: xAxis,
					y: yAxis,
					type: "scatter",
					mode: "lines",
				},
			]}
			layout={{ title: { text: "test" } }}
		/>
	);
}
