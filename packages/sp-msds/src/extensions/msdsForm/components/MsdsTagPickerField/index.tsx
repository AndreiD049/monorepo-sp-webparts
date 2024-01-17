import { Icon, ITag, Label, TagPicker } from '@fluentui/react';
import * as React from 'react';
import { Controller } from 'react-hook-form';
import { IMSDSRequest } from '../../services/IMSDSRequest';
import { MSDSFormProps } from '../MSDSTextField';
import { TextError } from '../TextError';
import styles from './MsdsTagPickerField.module.scss';

export interface IMsdsTagPickerFieldProps extends MSDSFormProps {
    id: keyof IMSDSRequest;
    label: string;
    title?: string;
    tags: ITag[];
    style?: React.CSSProperties;
    className?: string;
    handleFilter: (filter: string) => Promise<ITag[]>;
    handleSelect?: (tag: ITag) => void;
	getValue?: (value: ITag) => string|number;
    icon?: JSX.Element;
}

export const MsdsTagPickerField: React.FC<IMsdsTagPickerFieldProps> = (
    props
) => {
    const handleFilter = React.useCallback(
        async (filter: string) => {
            return props.handleFilter(filter.toLowerCase());
        },
        [props.tags]
    );

	const getValue = props.getValue	|| ((value: ITag) => value.key);

    return (
        <div
            className={`${styles.container} ${props.className}`}
            title={props.title}
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
                        iconName="MultiSelect"
                        style={{ marginRight: '.3em' }}
                    />
                )}{' '}
                <span>{props.label}</span>
            </Label>
            <Controller
                name={props.id}
                control={props.control}
                rules={props.rules}
                render={({ field, fieldState }) => {
                    const selected = React.useMemo(() => {
                        if (field.value) {
                            return props.tags
                                .filter((tag) => getValue(tag) === field.value)
                                .slice(0, 1);
                        }
                        return [];
                    }, [field.value, props.tags]);

                    return (
                        <>
                            <TagPicker
                                onEmptyResolveSuggestions={() => props.tags}
                                onResolveSuggestions={(filter, selected) =>
                                    handleFilter(filter)
                                }
                                styles={{
                                    text: {
                                        backgroundColor: '#ffffff',
                                        minWidth: 'auto',
                                    },
                                }}
                                ref={field.ref}
                                itemLimit={1}
                                selectedItems={selected}
                                onChange={(selected) => {
                                    const value =
                                        selected.length > 0
                                            ? selected[0]
                                            : null;
                                    field.onChange(value ? getValue(value) : null);
                                    if (props.handleSelect) {
                                        props.handleSelect(value);
                                    }
                                    return selected;
                                }}
                                disabled={props.rules?.disabled}
                            />
                            <TextError
                                error={
                                    fieldState.error && fieldState.error.message
                                }
                            />
                        </>
                    );
                }}
            />
        </div>
    );
};
