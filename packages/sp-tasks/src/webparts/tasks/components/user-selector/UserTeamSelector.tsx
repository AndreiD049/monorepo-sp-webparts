import { clone } from '@microsoft/sp-lodash-subset';
import {
    Checkbox,
    ComboBox,
    IComboBoxOption,
    ISelectableOption,
    SelectableOptionMenuItemType,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { IUser } from '../../models/IUser';
import GlobalContext from '../../utils/GlobalContext';
import styles from './UserTeamSelector.module.scss';

export interface IUserSelectorProps extends React.HTMLAttributes<HTMLDivElement> {
    users: IUser[];
    setUsers: React.Dispatch<React.SetStateAction<IUser[]>>;
}

const isOptionDisabled = (maxPeople: number, optionUser: IUser, users: IUser[]): boolean => {
    if (users.find((u) => u.User.ID === optionUser.User.ID)) {
        return false;
    }
    return maxPeople <= users.length;
};

interface ITeamCheckboxProps {
    props: ISelectableOption;
    selectedUsers: IUser[];
    setSelectedUsers: React.Dispatch<React.SetStateAction<IUser[]>>;
    maxPeople: number;
}

const TeamCheckbox: React.FC<ITeamCheckboxProps> = ({
    props,
    maxPeople,
    selectedUsers,
    setSelectedUsers,
}) => {
    const selectedSet = React.useMemo(() => {
        return new Set(selectedUsers.map((user) => user.User.ID));
    }, [selectedUsers]);
    const teamSet = React.useMemo(() => {
        return new Set(props.data.map((user: IUser) => user.User.ID));
    }, [props.data]);
    const isSelected = React.useMemo(() => {
        return props.data.every((user: IUser) => selectedSet.has(user.User.ID));
    }, [selectedSet, props.data]);
    const isIntermediate = React.useMemo(() => {
        return props.data.some((user: IUser) => selectedSet.has(user.User.ID));
    }, [selectedSet, props.data]);

    const handleChange = React.useCallback(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (_ev: any, checked: boolean) => {
            setSelectedUsers((users: IUser[]) => {
                let selected: IUser[] = clone(users);
                if (checked) {
                    props.data.forEach((user: IUser) => {
                        if (!selectedSet.has(user.User.ID) && selected.length < maxPeople) {
                            selected.push(user);
                        }
                    });
                } else {
                    selected = selected.filter((user) => !teamSet.has(user.User.ID));
                }
                return selected;
            });
        },
        [selectedSet]
    );

    return (
        <div className={styles.teamCheckbox}>
            <Checkbox
                id={props.key.toString()}
                indeterminate={!isSelected && isIntermediate}
                checked={isSelected}
                onChange={handleChange}
                disabled={!isSelected && !isIntermediate && selectedUsers.length >= maxPeople}
            />
            <label htmlFor={props.key.toString()}>{props.text}</label>
        </div>
    );
};

const UserTeamSelctor: React.FC<IUserSelectorProps> = (props) => {
    const { teamMembers, maxPeople } = React.useContext(GlobalContext);

    const options = React.useMemo(() => {
        const result: IComboBoxOption[] = [];
        const teams = Object.keys(teamMembers).filter(k => k !== 'All');
        teams.forEach((team, idx) => {
            result.push({
                key: team,
                text: team,
                disabled: false,
                data: teamMembers[team],
                itemType: SelectableOptionMenuItemType.Header,
            });
            result.push({
                key: team + idx,
                text: '-',
                disabled: false,
                itemType: SelectableOptionMenuItemType.Divider,
            });
            teamMembers[team].forEach((user) => {
                result.push({
                    key: team + user.User.ID,
                    text: user.User.Title,
                    data: user,
                    disabled: isOptionDisabled(maxPeople, user, props.users),
                    itemType: SelectableOptionMenuItemType.Normal,
                });
            });
        });
        return result;
    }, [teamMembers, props.users]);

    const selectedKeys = React.useMemo(() => {
        const result: string[] = [];
        props.users.forEach((u) => {
            u.Teams.forEach((team) => {
                result.push(team + u.User.ID);
            })
        })
        return result;
    }, [props.users]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleChange = (_ev: any, option: IComboBoxOption) => {
        if (option.selected) {
            props.setUsers([...props.users, option.data]);
        } else {
            const teamMembersSet: Set<number> = new Set(options.filter((o) => o.data).map((o) => o.data.ID));
            props.setUsers(props.users.filter((u) => u.User.ID !== option.data.User.ID && teamMembersSet.has(u.User.ID)));
        }
    };

    return (
        <div className={props.className}>
            <ComboBox
                errorMessage={
                    props.users.length >= maxPeople ? 'Maximum number of users selected' : ''
                }
                multiSelect
                options={options}
                selectedKey={selectedKeys}
                onChange={handleChange}
                allowFreeform
                useComboBoxAsMenuWidth
                calloutProps={{
                    calloutMaxHeight: 600,
                }}
                onRenderItem={(props, defaultRender) => {
                    if (props.itemType === SelectableOptionMenuItemType.Normal) {
                        return <div className={styles.userCheckbox}>{defaultRender(props)}</div>;
                    }
                    return defaultRender(props);
                }}
                onRenderOption={(defProps, defaultRender) => {
                    if (defProps.itemType === SelectableOptionMenuItemType.Header) {
                        return (
                            <TeamCheckbox
                                props={defProps}
                                maxPeople={maxPeople}
                                selectedUsers={props.users}
                                setSelectedUsers={props.setUsers}
                            />
                        );
                    }
                    return defaultRender(defProps);
                }}
            />
        </div>
    );
};

export default UserTeamSelctor;
