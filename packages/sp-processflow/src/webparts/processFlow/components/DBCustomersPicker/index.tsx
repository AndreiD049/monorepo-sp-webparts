import {
    ITag,
    Label,
    TagPicker,
    ValidationState,
} from '@fluentui/react';
import * as React from 'react';
import styles from './DBCustomersPicker.module.scss';

export interface IDBCustomersPickerProps {
    // Props go here
    options: string[];
    disabled?: boolean;
    onSelect?: (dbCustomers: string[]) => void;
    selectedOptions?: string[];
    style?: React.CSSProperties;
}

export const DBCustomersPicker: React.FC<IDBCustomersPickerProps> = (props) => {
    const controlled: boolean = React.useMemo(() => Boolean(props.selectedOptions?.length), [props.selectedOptions]);
    const ctrSelected = React.useMemo(() => {
        if (controlled) {
            return props.selectedOptions.map((o) => ({
                key: o,
                name: o,
            }));
        }
        return [];
    }, [props.selectedOptions]);
    const [selected, setSelected] = React.useState<ITag[]>([]);
    const options: ITag[] = React.useMemo(
        () => props.options.map((o) => ({ name: o, key: o })),
        [props.options]
    );

    return (
        <div className={styles.container} style={props.style}>
            <Label htmlFor="newFlowCustomerGroup">DB Customers</Label>
            <TagPicker
                disabled={props.disabled}
                inputProps={{
                    id: 'newFlowCustomerGroup',
                }}
                onValidateInput={(input) =>
                    input.trim() !== ''
                        ? ValidationState.valid
                        : ValidationState.invalid
                }
                createGenericItem={(item) => {
                    return {
                        key: item.trim(),
                        name: item.trim(),
                    };
                }}
                onChange={(items) => {
                    if (!controlled) {
                        setSelected(items);
                    }
                    if (props.onSelect)
                        props.onSelect(items.map((i) => i.name));
                }}
                selectedItems={controlled ? ctrSelected : selected}
                onEmptyResolveSuggestions={(selected) => {
                    const s = selected.map((s) => s.name);
                    return options.filter((o) => s.indexOf(o.name) === -1);
                }}
                onResolveSuggestions={(filter, selected) => {
                    const f = filter.toLowerCase();
                    const s = selected.map((s) => s.name);
                    return options
                        .filter((o) => s.indexOf(o.name) === -1)
                        .filter((o) => o.name.toLowerCase().includes(f));
                }}
            />
        </div>
    );
};
