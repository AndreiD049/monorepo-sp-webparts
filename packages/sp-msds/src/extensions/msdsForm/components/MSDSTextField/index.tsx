import {
    Icon,
    ITextFieldProps,
    Label,
    TextField,
} from '@fluentui/react';
import * as React from 'react';
import { Controller } from 'react-hook-form';
import { Control, RegisterOptions } from 'react-hook-form/dist/types';
import { IMSDSRequest } from '../../services/IMSDSRequest';
import styles from './MSDSTextField.module.scss';

export interface MSDSFormProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: Control<any>;
    rules?: Omit<
        RegisterOptions,
        'valueAsNumber' | 'valueAsDate' | 'setValueAs'
    >;
}

export interface IMSDSTextFieldProps extends MSDSFormProps {
    id: keyof IMSDSRequest;
    label: string;
    title?: string;
    fieldProps?: ITextFieldProps;
    style?: React.CSSProperties;
    icon?: JSX.Element;
}

export const MSDSTextField: React.FC<IMSDSTextFieldProps> = (props) => {
    return (
        <div
            title={props.title}
            className={styles.container}
            style={props.style}
        >
            <Label className={props.icon ? 'platoRequiredLabel labelFlex' : 'labelFlex'} required={Boolean(props.rules?.required)} htmlFor={props.id}>
                {
                    props.icon || (
                        <Icon iconName="TextField" style={{ marginRight: '.3em' }} />
                    )
                }{' '}
                <span>{props.label}</span>
            </Label>
            <Controller
                name={props.id}
                control={props.control}
                rules={props.rules}
                render={({ field, fieldState }) => (
                    <TextField
                        id={props.id}
                        {...props.fieldProps}
                        onChange={(_ev, newValue) => field.onChange(newValue)}
                        onBlur={field.onBlur}
                        value={field.value}
                        disabled={props.rules?.disabled}
                        componentRef={field.ref}
                        errorMessage={
                            fieldState.error && fieldState.error.message
                        }
                    />
                )}
            />
        </div>
    );
};
