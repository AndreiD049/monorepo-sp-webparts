import { CompactPeoplePicker, IPersonaProps, Label, Stack } from 'office-ui-fabric-react';
import * as React from 'react';
import MainService from '../../../services/main-service';

export interface IPeoplePickerProps {
    selectedUsers: IPersonaProps[];
    onUsersSelected: (users: IPersonaProps[]) => void;
}

export const PeoplePicker: React.FC<IPeoplePickerProps> = (props) => {
    const userService = React.useMemo(() => MainService.getUserService(), []);
    const [users, setUsers] = React.useState<IPersonaProps[]>([]);
    const selectedSet = React.useMemo(() => {
        const ids = props.selectedUsers.map((s) => s.id);
        return new Set<string>(ids);
    }, [props.selectedUsers]);
    const nonSelectedUsers = React.useMemo(() => {
        return users.filter((u) => !selectedSet.has(u.id));
    }, [selectedSet, users]);

    React.useEffect(() => {
        async function run() {
            const userProps = await userService.getPersonaProps(false);
            setUsers(userProps);
        }
        run();
    }, []);

    return (
        <Stack>
            <Label htmlFor="ActionLogUsersPicker">Users</Label>
            <CompactPeoplePicker
                itemLimit={10}
                inputProps={{ id: 'ActionLogUsersPicker', placeholder: props.selectedUsers.length === 0 ? 'Everyone' : '' }}
                onResolveSuggestions={(filter: string) =>
                    nonSelectedUsers.filter((u) =>
                        u.text.toLowerCase().includes(filter.toLowerCase())
                    )
                }
                onEmptyResolveSuggestions={() => nonSelectedUsers}
                selectedItems={props.selectedUsers}
                onChange={props.onUsersSelected}
            />
        </Stack>
    );
};
