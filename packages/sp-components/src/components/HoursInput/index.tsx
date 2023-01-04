import { Position, SpinButton } from 'office-ui-fabric-react';
import * as React from 'react';
import styles from './HoursInput.module.scss';
import { formatHours, validateHours } from './utils';

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

export const HoursInput: React.FC<IHoursInputProps> = (props) => {
    const handleButtonClick = (buttonVal: number): (ev: React.MouseEvent) => void => (ev: React.MouseEvent) => {
        ev.preventDefault();
        const result = props.value + buttonVal;
        if (result > 0) {
            props.onChange(result);
        } else {
            props.onChange(0);
        }
    }

    const handleValidate = (val: string): string => {
        const valNumber = validateHours(val);
        console.log(valNumber);
        props.onChange(valNumber);
        return val;
    }

    return (
        <div className={styles.input}>
            <SpinButton
                labelPosition={Position.top}
                label={props.label}
                min={0}
                value={`${formatHours(props.value)} hour(s)`}
                onIncrement={(val) => props.onChange(Number.parseFloat(val) + 1)}
                onDecrement={(val) => props.onChange(Math.max(Number.parseFloat(val) - 1, 0))}
                onValidate={handleValidate}
            />
            <div className={styles.inputButtonWrapper}>
                {props.buttons.filter((b) => b.value > 0).map((button) => (
                    <button key={button.value} tabIndex={-1} className={styles.inputButton} onClick={handleButtonClick(button.value)}>{button.label}</button>
                ))}
            </div>
            <div className={styles.inputButtonWrapper}>
                {props.buttons.filter((b) => b.value < 0).map((button) => (
                    <button tabIndex={-1} type="button" key={button.key} className={styles.inputButton} onClick={handleButtonClick(button.value)}>{button.label}</button>
                ))}
            </div>
        </div>
    );
};
