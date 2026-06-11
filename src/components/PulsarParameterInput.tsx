import type { ComponentProps } from "react";

export interface PulsarParameterInputProps extends ComponentProps<"input"> {
	label?: string;
}

export function PulsarParameterInput(props: PulsarParameterInputProps) {
	const { label, name, ...rest } = props;

	return (
		<div className="pulsar-parameter-input">
			{(() => {
				if (label !== undefined) {
					return <label htmlFor={name}>{label}</label>;
				}
			})()}
			<input type="range" name={name} {...rest} />
			<input type="number" name={name} {...rest} />
		</div>
	);
}
