import {
    DatePicker,
    Icon,
    IDatePickerProps,
    Label,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { Controller } from 'react-hook-form';
import { IMSDSRequest } from '../../services/IMSDSRequest';
import { formatDate } from '../../utils';
import { MSDSFormProps } from '../MSDSTextField';
import { TextError } from '../TextError';

export interface IMSDSDatePickerProps extends MSDSFormProps {
    id: keyof IMSDSRequest;
    label: string;
    title?: string;
    pickerProps?: IDatePickerProps;
    style?: React.CSSProperties;
    icon?: JSX.Element;
}

export const MSDSDatePicker: React.FC<IMSDSDatePickerProps> = (props) => {
    return (
        <div title={props.title} style={props.style}>
            <Label className={props.icon ? 'platoRequiredLabel labelFlex' : 'labelFlex'} required={Boolean(props.rules?.required)} htmlFor={props.id}>
                {
                    props.icon || (
                        <Icon iconName="Calendar" style={{ marginRight: '.3em' }} />
                    )
                }{' '}
                <span>{props.label}</span>
            </Label>
            <Controller
                name={props.id}
                control={props.control}
                rules={props.rules}
                render={({ field, fieldState }) => (
                    <>
                        <DatePicker
                            id={props.id}
                            {...props.pickerProps}
                            value={field.value ? new Date(field.value) : null}
                            formatDate={(date) => date.toLocaleDateString()}
                            onSelectDate={(date) =>
                                field.onChange(formatDate(date))
                            }
                            disabled={props.rules?.disabled}
                        />
                        <TextError
                            error={fieldState.error && fieldState.error.message}
                        />
                    </>
                )}
            />
        </div>
    );
};
