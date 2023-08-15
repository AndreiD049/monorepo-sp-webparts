import { Dropdown, IDropdownProps, Label } from 'office-ui-fabric-react';
import * as React from 'react';

export interface IPropertyDropdownProps extends IDropdownProps {
    readonly?: boolean;
}

export const PropertyDropdown: React.FC<IPropertyDropdownProps> = (props) => {
    if (props.readonly) {
        const labelStyles = (props.styles as { label: React.CSSProperties })?.label;
        const dropdownStyles = (props.styles as { dropdown: React.CSSProperties })?.dropdown;

		const option = props.options.find((o) => o.key === props.selectedKey);
		if (!option) return null;

		let item = (<>{option.text}</>)
		if (props.onRenderTitle) {
			item = props.onRenderTitle([option]);
		}
        return (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                }}
            >
                <Label style={labelStyles}>{props.label}</Label>
                <span style={{
					padding: '0px 28px 0px 8px',
					borderBottom: '1px solid #ccc',
					height: '32px',
					lineHeight: '32px',
					boxSizing: 'border-box',
					...dropdownStyles
				}}>{item}</span>
            </div>
        );
    }
    return (
        <Dropdown
            {...props}
            styles={{
                root: {
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem',
                },
                ...props.styles,
            }}
        />
    );
};
