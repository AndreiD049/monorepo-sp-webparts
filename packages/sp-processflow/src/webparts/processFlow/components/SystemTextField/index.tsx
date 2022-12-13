import { ITextFieldProps, TextField } from 'office-ui-fabric-react';
import * as React from 'react';
import { MainService } from '../../services/main-service';
import styles from './SystemTextField.module.scss';

export interface ISystemTextFieldProps extends ITextFieldProps {
}

export const SystemTextField: React.FC<ISystemTextFieldProps> = (props) => {
    const { ProcessService } = MainService;
    const [choices, setChoices] = React.useState<string[]>([]);

    React.useEffect(() => {
        async function run(): Promise<void> {
            if (!props.readOnly && !props.disabled && choices.length === 0) {
                setChoices(await ProcessService.getSystemChoices());
            }
        }
        run().catch((err) => console.error(err));
    }, [props.readOnly, props.disabled]);

    return (
        <div>
            <TextField
                {...props}
                list='SystemTextField'
            />
            <datalist id='SystemTextField'>
                {
                    choices.map((c) => <option key={c}>{c}</option>)
                }
            </datalist>
        </div>
    );
};
