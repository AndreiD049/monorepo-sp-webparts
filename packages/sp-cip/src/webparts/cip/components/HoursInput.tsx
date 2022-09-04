import {
    Position,
    SpinButton,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { MINUTE_DURATION } from '../utils/constants';
import { formatHours, validateHours } from '../utils/hours-duration';
import styles from './HoursInput.module.scss';

export interface IHoursInputProps {
    label?: string;
    value: number;
    onChange: (val: number) => void;
    buttons: {
        key: string;
        value: number;
        label: string;
    }[];
}

/**
 * Used to insert the number of hours Estimated or Logged for a task
 * Unit of measure is 'hours', so it will be a float number
 * Ex: 10 hours, 9.5 hours etc.
 *
 * Below the input, a set of buttons will be added to ease insertion of numbers
 */
export const HoursInput: React.FC<IHoursInputProps> = (props) => {
    const handleButtonClick = (buttonVal: number) => (ev: React.MouseEvent) => {
        ev.preventDefault();
        const result = props.value + buttonVal;
        if (result > 0) {
            props.onChange(result);
        } else {
            props.onChange(0);
        }
    }

    const handleValidate = (val: string) => {
        const valNumber = validateHours(val);
        console.log(valNumber);
        props.onChange(valNumber);
        return val;
    }

    return (
        <div className={styles['input']}>
            <SpinButton
                labelPosition={Position.top}
                label={props.label}
                min={0}
                value={`${formatHours(props.value)} hour(s)`}
                onIncrement={(val) => props.onChange(Number.parseFloat(val) + 1)}
                onDecrement={(val) => props.onChange(Number.parseFloat(val) - 1)}
                onValidate={handleValidate}
            />
            <div className={styles['input__button-wrapper']}>
                {props.buttons.filter((b) => b.value > 0).map((button) => (
                    <button tabIndex={-1} className={styles['input__button']} onClick={handleButtonClick(button.value)}>{button.label}</button>
                ))}
            </div>
            <div className={styles['input__button-wrapper']}>
                {props.buttons.filter((b) => b.value < 0).map((button) => (
                    <button tabIndex={-1} type="button" key={button.key} className={styles['input__button']} onClick={handleButtonClick(button.value)}>{button.label}</button>
                ))}
            </div>
        </div>
    );
};
