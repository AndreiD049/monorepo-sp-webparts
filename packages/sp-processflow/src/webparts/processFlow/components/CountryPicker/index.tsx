import {
    ITag,
    Label,
    TagItem,
    TagPicker,
    Text,
    ValidationState,
} from '@fluentui/react';
import * as React from 'react';
import styles from './CountryPicker.module.scss';

export interface ICountryPickerProps {
    disabled?: boolean;
    selectedOptions?: string[];
    options: string[];
    onSelect?: (opt: string[]) => void;
    required?: boolean;
}

export const CountryPicker: React.FC<ICountryPickerProps> = (props) => {
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
        [controlled, props.selectedOptions]
    );
    const options: ITag[] = React.useMemo(() => {
        return props.options.map((o) => ({
            name: o,
            key: o,
        }));
    }, [props.options]);

    return (
        <div className={styles.container}>
            <Label required={props.required} htmlFor="newFlowCountries">
                Countries
            </Label>
            <TagPicker
                disabled={props.disabled}
                inputProps={{
                    id: 'newFlowCountries',
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
                onRenderItem={(props) => {
                    const tokens = props.item.key.toString().split(' - ');
                    return (
                        <TagItem {...props}>
                            <div style={{
                                display: 'flex',
                                flexFlow: 'row nowrap',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '4px',
                            }}>
                                <img src={`https://flagcdn.com/24x18/${tokens[1].toLowerCase()}.png`} title={tokens[0]} />
                                <Text variant="medium">{props.item.key}</Text>
                            </div>
                        </TagItem>
                    );
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
                tabIndex={-1}
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
