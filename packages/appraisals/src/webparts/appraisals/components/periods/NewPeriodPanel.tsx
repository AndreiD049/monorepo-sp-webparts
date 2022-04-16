import * as React from 'react';
import {
    Panel,
    TextField,
    Stack,
    PrimaryButton,
    DefaultButton,
    getTheme,
} from 'office-ui-fabric-react';
import IPeriod from '../../dal/IPeriod';
import UserContext from '../../utils/UserContext';

export interface INewPeriodPanelProps {
    isOpen: boolean;
    setOpen: (val: boolean) => void;
    update: () => void;
}

const theme = getTheme();

const NewPeriodPanel: React.FC<INewPeriodPanelProps> = (props) => {
    const handleDismiss = () => props.setOpen(false);
    const ctx = React.useContext(UserContext);
    const [title, setTitle] = React.useState<string>('');

    /* When pressign 'Create', create the period via API */
    const handleCreate = async () => {
        const newPeriod: Partial<IPeriod> = {
            Title: title,
            Status: 'Open',
        };
        await ctx.PeriodService.createPeriod(newPeriod);
        setTitle('');
        handleDismiss();
        props.update();
    };

    const footer = () => (
        <Stack
            style={{ marginBottom: theme.spacing.l1 }}
            horizontal
            horizontalAlign="start"
        >
            <PrimaryButton
                style={{ marginLeft: theme.spacing.m }}
                text="Create"
                onClick={handleCreate}
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
            isFooterAtBottom
            onRenderFooter={footer}
        >
            <TextField
                label="Title"
                value={title}
                onChange={(_e: any, newValue: string) => setTitle(newValue)}
            />
        </Panel>
    );
};

export default NewPeriodPanel;
