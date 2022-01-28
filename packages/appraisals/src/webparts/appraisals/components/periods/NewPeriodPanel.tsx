import * as React from 'react';
import {
    Panel,
    TextField,
    Stack,
    PrimaryButton,
    DefaultButton,
    getTheme,
} from 'office-ui-fabric-react';

export interface INewPeriodPanelProps {
    isOpen: boolean;
    setOpen: (val: boolean) => void;
}

const theme = getTheme();

const NewPeriodPanel: React.FC<INewPeriodPanelProps> = (props) => {
    const handleDismiss = () => props.setOpen(false);

    const footer = () => (
        <Stack horizontal horizontalAlign="start">
            <PrimaryButton
                style={{ marginLeft: theme.spacing.m }}
                text="Create"
            />
            <DefaultButton
                style={{ marginLeft: theme.spacing.s1 }}
                text="Cancel"
                onClick={handleDismiss}
            />
        </Stack>
    );

    return (
        <Panel
            isOpen={props.isOpen}
            isLightDismiss
            onDismiss={handleDismiss}
            headerText="New period"
            onRenderFooter={footer}
        >
            <TextField label="Title" />
        </Panel>
    );
};

export default NewPeriodPanel;
