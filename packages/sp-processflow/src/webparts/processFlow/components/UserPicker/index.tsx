import * as React from 'react';
import styles from './UserPicker.module.scss';
import { IPersonaProps, NormalPeoplePicker } from 'office-ui-fabric-react';
import { GlobalContext } from '../../utils/globalContext';
import { Label } from '@fluentui/react';
import { getTeamPersonaProps } from '../../utils/varia';

export interface IUserPickerProps {
    selectedIds: number[];
    onUserSelected: (users: (IPersonaProps & { data?: number })[]) => void;
	label?: string;
	additionalUsers?: (IPersonaProps & { data: number })[];
}

export const UserPicker: React.FC<IUserPickerProps> = ({ label = "Selected users", ...props }) => {
    const { teamUsers } = React.useContext(GlobalContext);
    let userOptions = getTeamPersonaProps(teamUsers);
	if (props.additionalUsers) {
		userOptions = [...props.additionalUsers, ...userOptions];
	}
    const selected = userOptions.filter(
        (u) => props.selectedIds.indexOf(u.data || -1) !== -1
    );

    const excludeSelected = (selected: IPersonaProps[]): IPersonaProps[] => {
        return userOptions.filter((u) => {
            return (
                selected.find((su) => su.secondaryText === u.secondaryText) ===
                undefined
            );
        });
    };

    return (
        <div className={styles.container}>
            <Label htmlFor="selectedUsers">{label}</Label>
            <NormalPeoplePicker
                inputProps={{ id: 'selectedUsers', placeholder: selected.length === 0 ? 'All users' : '' }}
                selectedItems={selected}
                onResolveSuggestions={function (
                    filter: string,
                    selectedItems?: IPersonaProps[]
                ): IPersonaProps[] | PromiseLike<IPersonaProps[]> {
                    filter = filter.toLowerCase();
                    return excludeSelected(selectedItems).filter(
                        (u) => u.text.toLowerCase().indexOf(filter) > -1
                    );
                }}
                onEmptyResolveSuggestions={function (selected) {
                    return excludeSelected(selected);
                }}
                onChange={function (items) {
                    props.onUserSelected(items);
                }}
            />
        </div>
    );
};
