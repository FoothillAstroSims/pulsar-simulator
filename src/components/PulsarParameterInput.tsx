import type { FormControlProps } from "react-bootstrap";
import { Col, Form, Row } from "react-bootstrap";

export interface PulsarParameterInputProps extends FormControlProps {
	label?: string;
}

/**
 * Inputs for a pulsar model parameter
 */
export function PulsarParameterInput(props: PulsarParameterInputProps) {
	const { label, name, size, ...rest } = props;

	return (
		<Form.Group as={Row} className="w-100">
			{(() => {
				if (label !== undefined) {
					return (
						<Form.Label column xs={3}>
							{label}
						</Form.Label>
					);
				}
			})()}
			<Col xs={6}>
				<Form.Range name={name} {...rest} />
			</Col>
			<Col xs={3}>
				<Form.Control type="number" name={name} size={size} {...rest} />
			</Col>
		</Form.Group>
		// <div className="pulsar-parameter-input">
		// 	{(() => {
		// 		if (label !== undefined) {
		// 			return (
		// 				<label htmlFor={name} style={{ flex: 1 }}>
		// 					{label}
		// 				</label>
		// 			);
		// 		}
		// 	})()}
		// 	<input
		// 		type="range"
		// 		name={name}
		// 		style={{ flex: 3 }}
		// 		{...rest}
		// 	/>
		// 	<input type="number" name={name} style={{ flex: 1 }} {...rest} />
		// </div>
	);
}
