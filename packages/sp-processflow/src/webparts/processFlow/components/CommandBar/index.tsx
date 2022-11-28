import {
    ActionButton,
    ComboBox,
    IComboBoxOption,
    IComboBoxStyles,
    Icon,
    Label,
    Text,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { showDialog } from 'sp-components';
import { MAIN_DIALOG } from '../../utils/constants';
import { GlobalContext } from '../../utils/globalContext';
import { NewFlowForm } from '../NewFlowForm';
import { ProcessFlowHeader } from '../ProcessFlowHeader';
import styles from './CommandBar.module.scss';

export interface ICommandBarProps {
    onTeamSelected: (team: string) => void;
}

const comboBoxStyles: Partial<IComboBoxStyles> = {
    root: {
        maxWidth: 300,
    },
};

export const CommandBar: React.FC<ICommandBarProps> = (props) => {
    const { teams, selectedTeam, selectedFlow } =
        React.useContext(GlobalContext);

    const options: IComboBoxOption[] = React.useMemo(
        () =>
            teams.map((team) => ({
                key: team,
                text: team,
            })),
        [teams]
    );

    const handleNewFlow = React.useCallback(() => {
        showDialog({
            id: MAIN_DIALOG,
            dialogProps: {
                title: 'New flow',
                isBlocking: false,
            },
            content: <NewFlowForm />,
        });
    }, [selectedTeam]);

    return (
        <div className={styles.container}>
            <ComboBox
                label="Team"
                options={options}
                onChange={(_ev, option) =>
                    props.onTeamSelected(option.key.toString())
                }
                selectedKey={selectedTeam}
                styles={comboBoxStyles}
            />
            {selectedFlow && <ProcessFlowHeader flow={selectedFlow} />}
            <ActionButton
                onClick={handleNewFlow}
                disabled={!Boolean(selectedTeam)}
                iconProps={{ iconName: 'Add' }}
                styles={{ root: { maxHeight: 32 } }}
            >
                New flow
            </ActionButton>
        </div>
    );
};
