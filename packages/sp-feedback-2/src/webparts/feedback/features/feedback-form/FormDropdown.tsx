import * as React from 'react';
import styles from './FeedbackForm.module.scss';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react';

export function FormDropdown<T>(props: {
	options: T[];
	label: string;
	onChange: (option: T) => void;
	transform: (option: T) => IDropdownOption;
	additionalOptions?: IDropdownOption[];
	disabled?: boolean;
}): JSX.Element {
	const options = props.options.map((opt) => props.transform(opt)).concat(props.additionalOptions || []);

	const handleChange = (
		_event: React.FormEvent<HTMLDivElement>,
		option?: IDropdownOption
	): void => {
		if (!option) return;
		props.onChange(option.data);
	};

	return (
		<Dropdown
			required
			label={props.label}
			className={styles['country-dropdown']}
			placeholder="--Select--"
			options={options}
			onChange={handleChange}
			disabled={props.disabled}
		/>
	);
}
