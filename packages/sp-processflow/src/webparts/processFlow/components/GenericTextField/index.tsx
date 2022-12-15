import { ITextFieldProps, TextField } from 'office-ui-fabric-react';
import * as React from 'react';

export interface IGenericTextFieldProps extends ITextFieldProps {
    options: string[];
    getOptions: () => Promise<string[]>;
    listId: string;
}

export const GenericTextField: React.FC<IGenericTextFieldProps> = ({ options = [], ...props }) => {
    const [choices, setChoices] = React.useState<string[]>(options);

    React.useEffect(() => {
        async function run(): Promise<void> {
            if (!props.readOnly && !props.disabled && choices.length === 0) {
                setChoices(await props.getOptions());
            }
        }
        run().catch((err) => console.error(err));
    }, [props.readOnly, props.disabled]);

    return (
        <div>
            <TextField
                {...props}
                list={props.listId}
            />
            <datalist id={props.listId}>
                {
                    choices.map((c) => <option key={c}>{c}</option>)
                }
            </datalist>
        </div>
    );
};
