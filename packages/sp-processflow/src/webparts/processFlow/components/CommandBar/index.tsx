import {
    ActionButton,
    ComboBox,
    IComboBoxOption,
    IComboBoxStyles,
    Icon,
    Label,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { FooterOkCancel, hideDialog, showDialog } from 'sp-components';
import { MAIN_DIALOG } from '../../utils/constants';
import { GlobalContext } from '../../utils/globalContext';
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
    const { teams, selectedTeam } = React.useContext(GlobalContext);

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
                isBlocking: false,
            },
            content: <div>test</div>,
        });
    }, [selectedTeam]);

    return (
        <div className={styles.container}>
            <Label>
                <Icon iconName="Teamwork" />
            </Label>
            <ComboBox
                options={options}
                onChange={(_ev, option) =>
                    props.onTeamSelected(option.key.toString())
                }
                selectedKey={selectedTeam}
                styles={comboBoxStyles}
            />
            <ActionButton
                onClick={handleNewFlow}
                disabled={!Boolean(selectedTeam)}
                iconProps={{ iconName: 'Add' }}
            >
                New flow
            </ActionButton>
        </div>
    );
};
