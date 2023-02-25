import {
    ChoiceGroup,
    IChoiceGroupOption,
    IChoiceGroupProps,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { Item } from '../../item';

export interface ISelectChoicePropsPartial extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
    options: Item[];
    tag?: boolean;
    field?: string;
    optionProps?: Partial<IChoiceGroupOption>;
    choiceGroupProps?: Partial<IChoiceGroupProps>;
    target: Item;
    onChange: (item: Item) => void;
}

type ISelectChoiceProps =
    | (ISelectChoicePropsPartial & { tag: boolean })
    | (ISelectChoicePropsPartial & { field: string });

export const SelectChoice: React.FC<ISelectChoiceProps> = (props) => {
    const options: IChoiceGroupOption[] = React.useMemo(() => {
        return props.options.map((choice) => {
            const additionalProps: Partial<IChoiceGroupOption> =
                props.optionProps || {};
            const image = choice.getField<string>('image');
            if (image) {
                additionalProps.imageSrc = image;
                additionalProps.selectedImageSrc = image;
            } else if (additionalProps.iconProps === undefined) {
                const icon = choice.getField<string>('icon');
                if (icon) {
                    additionalProps.iconProps = {
                        iconName: icon,
                        ...additionalProps.iconProps,
                    };
                }
            }
            return {
                key: choice.Title,
                text: choice.getFieldOr('caption', choice.Title),
                ...additionalProps,
            };
        });
    }, [props.options]);

    const handleChange = React.useCallback(
        (_ev, option: IChoiceGroupOption) => {
            if (props.tag) {
                const optionsSet = new Set(options.map((o) => o.key));
                const newTags = props.target.Tags.filter(
                    (t) => !optionsSet.has(t)
                );
                newTags.push(option.key);
                props.onChange(props.target.setTags(newTags));
            } else if (props.field) {
                props.onChange(props.target.setField(props.field, option.key))
            }
        },
        [props.target]
    );

    const getSelectedKey = React.useCallback(
        (item: Item) => {
            if (props.tag) {
                const tagsSet = new Set(item.Tags);
                for (const option of options) {
                    if (tagsSet.has(option.key)) return option.key;
                }
            } else if (props.field) {
                return item.getField(props.field);
            }
            return '';
        },
        [props.tag, options]
    );
    
    if (props.options.length === 0) return null;

    return (
        <ChoiceGroup
            selectedKey={getSelectedKey(props.target)}
            options={options}
            {...props.choiceGroupProps}
            onChange={handleChange}
            style={props.style}
        />
    );
};
