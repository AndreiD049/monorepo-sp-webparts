import { Icon, ITag, Label, TagPicker } from 'office-ui-fabric-react';
import * as React from 'react';
import styles from './MsdsTagPickerField.module.scss';

export interface IMsdsTagPickerFieldProps {
    id: string;
    label: string;
    title?: string;
    tags: ITag[];
    required?: boolean;
    style?: React.CSSProperties;
    handleFilter: (filter: string) => Promise<ITag[]>;
    selectedTag: string;
    handleSelected?: (item: ITag) => void;
}

export const MsdsTagPickerField: React.FC<IMsdsTagPickerFieldProps> = (
    props
) => {
    const selectedItem = React.useMemo(() => {
        if (!props.selectedTag) return [];
        return [{
            key: props.selectedTag,
            name: props.selectedTag,
        }];
    }, [props.selectedTag]);
    const handleFilter = React.useCallback(
        async (filter: string) => {
            return props.handleFilter(filter.toLowerCase());
        },
        [props.tags]
    );

    return (
        <div className={styles.container} title={props.title} style={props.style}>
            <Label required={props.required} htmlFor={props.id}>
                <Icon iconName="MultiSelect" style={{ marginRight: '.3em' }} />{' '}
                <span>{props.label}</span>
            </Label>
            <TagPicker
                onEmptyResolveSuggestions={() => props.tags}
                onResolveSuggestions={(filter, selected) =>
                    handleFilter(filter)
                }
                itemLimit={1}
                selectedItems={selectedItem}
                onChange={(selected) => {
                    if (props.handleSelected) {
                        props.handleSelected(selected.length > 0 ? selected[0] : null);
                    }
                    return selected;
                }}
            />
        </div>
    );
};
