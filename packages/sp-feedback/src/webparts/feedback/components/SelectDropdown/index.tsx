import {
    Dropdown,
    Icon,
    IDropdownOption,
    IDropdownProps,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { Item } from '../../item';

export interface ISelectDropdownProps
    extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
    // options that user can select
    options: Item[];
    // target item. All changes will be done in regards to this item
    target: Item;
    // tag to be toggled on the item, if provided
    tag?: boolean;
    // if set, the given field will be updated with the selected value
    field?: string;
    onChange: (result: Item) => void;

    dropDownProps?: Omit<
        IDropdownProps,
        'options' | 'selectedKeys' | 'selectedKey' | 'onChange'
    >;
}

export const SelectDropdown: React.FC<ISelectDropdownProps> = (props) => {
    const options: IDropdownOption[] = React.useMemo(() => {
        return props.options.map((o) => ({
            key: o.Title,
            text: o.getFieldOr('caption', o.Title),
            data: o,
        }));
    }, [props.options]);

    const handleSelect = React.useCallback(
        (_ev, option: IDropdownOption) => {
            let result = props.target.clone();
            const key = option.key.toString();
            const optionSet = new Set(options.map((o) => o.key.toString()));
            if (props.tag) {
                const strippedTags = result.Tags.filter(
                    (t) => !optionSet.has(t)
                );
                result.Tags = [...strippedTags, key];
            }
            if (props.field) {
                result = result.setField(props.field, key);
            }
            props.onChange(result);
        },
        [props]
    );

    const handleSelectMultiple = React.useCallback(
        (_ev, option: IDropdownOption) => {
            const result = props.target.clone();
            const key = option.key.toString();
            if (props.tag) {
                if (option.selected) {
                    result.Tags = [...result.Tags, key];
                } else {
                    result.Tags = result.Tags.filter((t) => t !== key);
                }
            }
            if (props.field) {
                const fieldValue = result.getField(props.field);
                if (Array.isArray(fieldValue)) {
                    if (option.selected) {
                        result.setField(props.field, [...fieldValue, key]);
                    } else {
                        result.setField(
                            props.field,
                            fieldValue.filter((v) => v !== key)
                        );
                    }
                } else {
                    result.setField(props.field, [key]);
                }
            }
            props.onChange(result);
        },
        [props]
    );

    const getItemKey = React.useCallback(() => {
        if (props.tag) {
            const tagSet = new Set(props.target.Tags);
            const value = props.options.find((o) => tagSet.has(o.Title));
            return value ? value.Title : '';
        }
        if (props.field) {
            return props.target.getField(props.field);
        }
        return '';
    }, [props.target, props.tag, options]);

    const getItemKeys = React.useCallback(() => {
        if (props.tag) {
            const tagSet = new Set(props.target.Tags);
            const value = props.options.filter((o) => tagSet.has(o.Title));
            return value ? value.map((v) => v.Title) : [];
        }
        if (props.field) {
            return props.target.getField(props.field);
        }
        return [];
    }, [props.target, props.tag, options]);

    const additionalProps: Partial<IDropdownProps> = {};
    if (props.dropDownProps?.multiSelect) {
        additionalProps.selectedKeys = getItemKeys();
        additionalProps.onChange = handleSelectMultiple;
        additionalProps.multiSelect = true;
    } else {
        additionalProps.selectedKey = getItemKey();
        additionalProps.onChange = handleSelect;
    }

    const handleRenderOption = React.useCallback((props, defaultRender) => {
        const option: Item = props.data;
        if (option) {
            const icon: string = option.getField('icon');
            if (icon) {
                return (
                    <div>
                        <Icon iconName={icon} style={{ margin: '0 .5em' }} />
                        {defaultRender(props)}
                    </div>
                );
            }
        }
        return defaultRender(props);
    }, []);

    if (props.options.length === 0) return null;

    return (
        <Dropdown
            {...props.dropDownProps}
            options={options}
            {...additionalProps}
            onRenderOption={handleRenderOption}
            style={props.style}
        />
    );
};
