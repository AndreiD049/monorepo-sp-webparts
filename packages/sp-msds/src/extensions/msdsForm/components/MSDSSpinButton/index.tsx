import {
    Icon,
    ISpinButtonProps,
    Label,
    SpinButton,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { Controller } from 'react-hook-form';
import { IMSDSRequest } from '../../services/IMSDSRequest';
import { MSDSFormProps } from '../MSDSTextField';
import styles from './MSDSSpinButton.module.scss';

export interface IMSDSSpinButtonProps extends MSDSFormProps {
    id: keyof IMSDSRequest;
    label: string;
    title?: string;
    fieldProps?: ISpinButtonProps;
    style?: React.CSSProperties;
    icon?: JSX.Element;
}

const STEP = 0.001;
const DIGITS = 3;

export const MSDSSpinButton: React.FC<IMSDSSpinButtonProps> = (props) => {
    const handleValidate = React.useCallback((value: string) => {
        const number = parseFloat(value);
        let result = '0';
        if (isNaN(number)) {
            result = '0';
        } else if (number < 0) {
            result = '0';
        } else if (number > 1) {
            result = '1';
        } else {
            result = number.toFixed(DIGITS);
        }
        return result;
    }, []);

    const handleButtons = React.useCallback(
        (multiplier: 1 | -1) => (value: string) => {
            const numeric = +value;
            if (isNaN(numeric)) {
                return '0';
            }
            const result = numeric + STEP * multiplier;
            return handleValidate(result.toString());
        },
        [handleValidate]
    );

    return (
        <div
            title={props.title}
            className={styles.container}
            style={props.style}
        >
            <Label
                className={
                    props.icon ? 'platoRequiredLabel labelFlex' : 'labelFlex'
                }
                required={Boolean(props.rules?.required)}
                htmlFor={props.id}
            >
                {props.icon || (
                    <Icon
                        iconName="TextField"
                        style={{ marginRight: '.3em' }}
                    />
                )}{' '}
                <span>{props.label}</span>
            </Label>
            <Controller
                name={props.id}
                control={props.control}
                render={({ field, fieldState }) => (
                    <SpinButton
                        defaultValue="0"
                        min={0}
                        max={1}
                        disabled={props.rules?.disabled}
                        step={STEP}
                        onValidate={(value) =>
                            field.onChange(+handleValidate(value))
                        }
                        onIncrement={(value) => {
                            field.onChange(+handleButtons(1)(value));
                        }}
                        onDecrement={(value) => {
                            field.onChange(+handleButtons(-1)(value));
                        }}
                        value={field.value}
                    />
                )}
            />
        </div>
    );
};
