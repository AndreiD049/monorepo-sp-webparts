import {
    ITag,
    Label,
    TagPicker,
    ValidationState,
} from 'office-ui-fabric-react';
import * as React from 'react';
import styles from './DoneByPicker.module.scss';

export interface IDoneByPickerProps {
    disabled?: boolean;
    selectedOptions?: string[];
    options: string[];
    onSelect?: (opt: string[]) => void;
    required?: boolean;
}

export const DoneByPicker: React.FC<IDoneByPickerProps> = (props) => {
    const controlled: boolean = React.useMemo(
        () => Boolean(props.selectedOptions?.length),
        [props.selectedOptions]
    );
    const [selected, setSelected] = React.useState<ITag[]>([]);
    const externalSelected: ITag[] = React.useMemo(
        () =>
            controlled &&
            props.selectedOptions.map((o) => ({
                key: o,
                name: o,
            })),
        [controlled]
    );
    const options: ITag[] = React.useMemo(() => {
        return props.options.map((o) => ({
            name: o,
            key: o,
        }));
    }, [props.options]);

    return (
        <div className={styles.container}>
            <Label required={props.required} htmlFor="newFlowCustomerGroup">Done by</Label>
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
                selectedItems={controlled ? externalSelected : selected}
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
            <input
                style={{
                    height: 0,
                    border: 'none',
                    position: 'absolute',
                    outline: 'none',
                    zIndex: -1,
                }}
                required={props.required}
                value={
                    controlled
                        ? props.selectedOptions.join('')
                        : selected.map((s) => s.name).join('')
                }
            />
        </div>
    );
};
