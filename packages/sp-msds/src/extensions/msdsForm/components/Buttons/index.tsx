import { FormDisplayMode } from '@microsoft/sp-core-library';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react';
import * as React from 'react';
import styles from './Buttons.module.scss';

export interface IButtonsProps extends React.HTMLAttributes<HTMLDivElement> {
    displayMode: FormDisplayMode;
    onSave: () => void;
    onClose: () => void;
}

export const Buttons: React.FC<IButtonsProps> = (props) => {
    const buttons = React.useMemo(() => {
        const buttons: JSX.Element[] = [];
        if (props.displayMode === FormDisplayMode.New) {
            buttons.push(<PrimaryButton type="submit">Create</PrimaryButton>);
        } else {
            buttons.push(<PrimaryButton type="submit">Save</PrimaryButton>);
        }
        buttons.push(<DefaultButton onClick={() => props.onClose()}>Close</DefaultButton>);
        return buttons;
    }, [props.displayMode]);
    return (
        <div className={`${styles.msdsFormButtons} ${props.className}`}>
            {buttons}
        </div>
    );
};
