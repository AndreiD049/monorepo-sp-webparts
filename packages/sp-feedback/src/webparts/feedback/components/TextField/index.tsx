import * as React from 'react';
import {
    TextField as TF,
    ITextFieldProps as ITFProps,
} from 'office-ui-fabric-react';
import { Item } from '../../item';

export interface ITextFieldProps
    extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
    tag?: boolean;
    field?: string;
    textFieldProps?: Partial<ITFProps>;
    target: Item;
    onChange: (item: Item) => void;
}

export const TextField: React.FC<ITextFieldProps> = (props) => {
    const [value, setValue] = React.useState('');

    const handleChange = React.useCallback((_ev, newValue: string) => {
        setValue((prev) => {
            let result = props.target.clone();
            if (props.tag) {
                result.Tags = result.Tags.filter((t) => t !== prev);
                if (newValue) {
                    result.Tags.push(newValue);
                }
            } else if (props.field) {
                if (newValue) {
                    result = result.setField(props.field, newValue);                
                } else {
                    result = result.unsetField(props.field);
                }
            }
            props.onChange(result);
            return newValue;
        });
    }, [props.target, props.tag, props.field]);

    return (
        <TF {...props.textFieldProps} value={value} onChange={handleChange} />
    );
};
