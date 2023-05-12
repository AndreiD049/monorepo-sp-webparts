import * as React from 'react';
import styles from './UserPicker.module.scss';
import { IPersonaProps, NormalPeoplePicker } from 'office-ui-fabric-react';
import { GlobalContext } from '../../utils/globalContext';
import { Label } from '@fluentui/react';

export interface IUserPickerProps {
    selectedIds: number[];
    onUserSelected: (users: (IPersonaProps & { data?: number })[]) => void;
}

export const UserPicker: React.FC<IUserPickerProps> = (props) => {
    const { teamUsers } = React.useContext(GlobalContext);
    const userOptions: (IPersonaProps & { data: number })[] = teamUsers.map(
        (u) => {
            return {
                text: u.User.Title,
                secondaryText: u.User.EMail,
                data: u.User.Id,
                imageUrl: `/_layouts/15/userphoto.aspx?accountname=${u.User.EMail}&Size=M`,
            };
        }
    );
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
            <Label htmlFor="selectedUsers">Selected users</Label>
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
