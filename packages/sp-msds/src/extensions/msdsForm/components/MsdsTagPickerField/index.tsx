import { Icon, ITag, Label, TagPicker } from 'office-ui-fabric-react';
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

    return (
        <div
            className={`${styles.container} ${props.className}`}
            title={props.title}
            style={props.style}
        >
            <Label required={Boolean(props.rules?.required)} htmlFor={props.id}>
                <Icon iconName="MultiSelect" style={{ marginRight: '.3em' }} />{' '}
                <span>{props.label}</span>
            </Label>
            <Controller
                name={props.id}
                control={props.control}
                rules={props.rules}
                render={({ field, fieldState }) => {
                    let selected: ITag[] = [];
                    if (field.value) {
                        selected = props.tags.filter((tag) => tag.key === field.value);
                    }
                    return (
                        <>
                            <TagPicker
                                onEmptyResolveSuggestions={() => props.tags}
                                onResolveSuggestions={(filter, selected) =>
                                    handleFilter(filter)
                                }
                                ref={field.ref}
                                itemLimit={1}
                                selectedItems={selected}
                                onChange={(selected) => {
                                    field.onChange(
                                        selected.length > 0
                                            ? selected[0].key
                                            : null
                                    );
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
