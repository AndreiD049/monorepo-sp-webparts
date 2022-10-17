import { ActionType } from '@service/sp-cip/dist/services/action-service';
import { Dropdown, IDropdownOption, SelectableOptionMenuItemType } from 'office-ui-fabric-react';
import * as React from 'react';
import { ActionDropdownOption } from '..';
import styles from '../ActionLogPanel.module.scss';

export interface IActionDropdownProps {
    selectedAction: string;
    onActionChange: (action: ActionDropdownOption) => void;
}

const actions: ActionType[] = [
    'Comment',
    'Created',
    'Due date',
    'Estimated time',
    'Finished',
    'Priority',
    'Progress',
    'Responsible',
    'Status',
    'Time log',
];

export const ActionDropdown: React.FC<IActionDropdownProps> = (props) => {
    const options: IDropdownOption[] = React.useMemo(
        () =>
            [
                {
                    key: 'All',
                    text: 'All',
                },
                {
                    key: 'Divider',
                    text: '',
                    itemType: SelectableOptionMenuItemType.Divider,
                }
            ].concat(
                actions.map((a) => ({
                    key: a,
                    text: a,
                }))
            ),
        []
    );
    return (
        <Dropdown
            className={styles.headerDropdown}
            label="Action"
            selectedKey={props.selectedAction}
            onChange={(_ev, option) => props.onActionChange(option.key as ActionDropdownOption)}
            options={options}
        />
    );
};
