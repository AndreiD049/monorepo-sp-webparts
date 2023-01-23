import { Checkbox, Icon, Label, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { Controller } from 'react-hook-form';
import { IMSDSRequest } from '../../services/IMSDSRequest';
import { MSDSFormProps } from '../MSDSTextField';
import styles from './MSDSCheckbox.module.scss';

export interface IMSDSCheckboxProps extends MSDSFormProps {
    id: keyof IMSDSRequest;
    label: string;
    title?: string;
    style?: React.CSSProperties;
}

export const MSDSCheckbox: React.FC<IMSDSCheckboxProps> = (props) => {
    return (
        <div
            className={styles.container}
            title={props.title}
            style={props.style}
        >
            <Label htmlFor={props.id}>
                <Icon iconName="TaskManager" style={{ marginRight: '.3em' }} />{' '}
                <span>{props.label}</span>
            </Label>
            <div className={styles.checkboxRow}>
                <Controller
                    name={props.id}
                    control={props.control}
                    render={({ field, fieldState }) => (
                        <>
                            <Checkbox
                                id={props.id}
                                {...field}
                                checked={field.value}
                                disabled={props.rules?.disabled}
                            />
                            <Text variant="medium">
                                {field.value ? ' - Yes' : ' - No'}
                            </Text>
                        </>
                    )}
                />
            </div>
        </div>
    );
};
