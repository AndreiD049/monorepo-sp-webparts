import { Dropdown, IDropdownOption } from 'office-ui-fabric-react';
import * as React from 'react';
import IUser from '../../models/IUser';
import IUserCustom from '../../models/IUserCustom';

export interface IUserSelectorProps {
    users: IUserCustom[];
    selectedUser: IUser;
    handleUserSelect: (user: IUserCustom) => void;
}

export const UserSelector: React.FC<IUserSelectorProps> = (props) => {
    const options: IDropdownOption[] = React.useMemo(() => {
        return props.users.map((user) => ({
            key: user.User.Id,
            text: user.User.Title,
            data: user,
        }));
    }, [props.users]);

    return (
        <Dropdown
            options={options}
            selectedKey={props.selectedUser.Id}
            onChange={(ev, option) => props.handleUserSelect(option.data)}
            styles={{
                root: {
                    minWidth: 150
                }
            }}
        />
    );
};
