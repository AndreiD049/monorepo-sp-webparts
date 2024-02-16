import { Dropdown, Icon, IDropdown, IDropdownOption } from '@fluentui/react';
import * as React from 'react';
import IUser from '../../models/IUser';
import IUserCustom from '../../models/IUserCustom';

export interface IUserSelectorProps {
    users: IUserCustom[];
    selectedUser: IUser;
    handleUserSelect: (user: IUserCustom) => void;
}

export const UserSelector: React.FC<IUserSelectorProps> = (props) => {
    const dropdownRef = React.useRef<IDropdown>(null);
    const options: IDropdownOption[] = React.useMemo(() => {
        if (!props.users) return [];
        return props.users.map((user) => ({
            key: user.User.Id,
            text: user.User.Title,
            data: user,
        }));
    }, [props.users]);

    return (
        <span
            style={{
                display: 'flex',
                flexFlow: 'row nowrap',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Icon
                styles={{
                    root: {
                        fontSize: '1.5em',
                        marginRight: '.2em',
                        cursor: 'pointer'
                    },
                }}
                onClick={() => dropdownRef.current.focus(true)}
                iconName="ReminderPerson"
            />
            <Dropdown
                componentRef={dropdownRef}
                options={options}
                selectedKey={props.selectedUser?.Id}
                onChange={(_ev, option) => {
                    if (option.key !== props.selectedUser?.Id) {
                        props.handleUserSelect(option.data)
                    }
                }}
                styles={{
                    root: {
                        minWidth: 150,
                    },
                }}
            />
        </span>
    );
};
