import {
    Icon,
    ISpinButtonProps,
    Label,
    SpinButton,
} from 'office-ui-fabric-react';
import * as React from 'react';
import styles from './MSDSSpinButton.module.scss';

export interface IMSDSSpinButtonProps {
    id: string;
    label: string;
    title?: string;
    fieldProps?: ISpinButtonProps;
    style?: React.CSSProperties;
}

export const MSDSSpinButton: React.FC<IMSDSSpinButtonProps> = (props) => {
    return (
        <div
            title={props.title}
            className={styles.container}
            style={props.style}
        >
            <Label htmlFor={props.id}>
                <Icon iconName="TextField" style={{ marginRight: '.3em' }} />{' '}
                <span>{props.label}</span>
            </Label>
            <SpinButton
                defaultValue="0"
                min={0}
                max={1}
                step={0.001}
                onValidate={(value) => {
                    const number = parseFloat(value);
                    if (isNaN(number)) return '0';
                    if (number < 0 || number > 1) return '0';
                    return number.toFixed(3);
                }}
            />
        </div>
    );
};
