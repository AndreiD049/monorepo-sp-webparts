import {
    DatePicker,
    Icon,
    IDatePickerProps,
    Label,
} from 'office-ui-fabric-react';
import * as React from 'react';

export interface IMSDSDatePickerProps {
    id: string;
    label: string;
    title?: string;
    pickerProps?: IDatePickerProps;
    style?: React.CSSProperties;
    value: Date;
    onDateSelect: (date: Date) => void;
}

export const MSDSDatePicker: React.FC<IMSDSDatePickerProps> = (props) => {
    return (
        <div title={props.title} style={props.style}>
            <Label htmlFor={props.id}>
                <Icon iconName="Calendar" style={{ marginRight: '.3em' }} />{' '}
                <span>{props.label}</span>
            </Label>
            <DatePicker id={props.id} {...props.pickerProps} value={props.value} onSelectDate={props.onDateSelect} />
        </div>
    );
};
