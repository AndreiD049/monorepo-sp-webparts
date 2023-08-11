import { Dropdown, IDropdownProps } from 'office-ui-fabric-react';
import * as React from 'react';

export interface IPropertyDropdownProps extends IDropdownProps {}

export const PropertyDropdown: React.FC<IPropertyDropdownProps> = (props) => {
    return <Dropdown {...props} styles={{
		root: {
			display: 'flex',
			alignItems: 'flex-start',
			gap: '0.5rem',
		},
		...props.styles,
	}} />;
};
