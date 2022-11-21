import {
    ITag,
    Label,
    TagPicker,
    ValidationState,
} from 'office-ui-fabric-react';
import * as React from 'react';
import styles from './CustomerGroupPicker.module.scss';

export interface ICustomerGroupPickerProps {
    options: string[];
    disabled?: boolean;
    selectedOption?: string;
    onSelect?: (customerGroup: string) => void;
    style?: React.CSSProperties;
}

export const CustomerGroupPicker: React.FC<ICustomerGroupPickerProps> = (
    props
) => {
    const controlled: boolean = React.useMemo(() => {
        return props.selectedOption !== undefined;
    }, [props.selectedOption]);
    const ctrSelected = React.useMemo(() => {
        if (controlled && props.selectedOption) {
            return [
                {
                    key: props.selectedOption,
                    name: props.selectedOption,
                },
            ];
        }
        return [];
    }, [props.selectedOption]);
    const [selected, setSelected] = React.useState(null);
    const options: ITag[] = React.useMemo(
        () => props.options.map((o) => ({ name: o, key: o })),
        [props.options]
    );

    return (
        <div className={styles.container} style={props.style}>
            <Label htmlFor="newFlowCustomerGroup">Customer group</Label>
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
                        key: item,
                        name: item,
                    };
                }}
                onChange={(items) => {
                    if (!controlled) {
                        setSelected([items[0]]);
                    }
                    if (props.onSelect) props.onSelect(items.length > 0 ? items[0].name : null);
                }}
                selectedItems={controlled ? ctrSelected : selected}
                onEmptyResolveSuggestions={(sel) => options}
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
