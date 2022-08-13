import { CompactPeoplePicker, IPersonaProps, Label, PersonaSize } from 'office-ui-fabric-react';
import * as React from 'react';
import GlobalContext from '../../utils/GlobalContext';
import { userToPeoplePickerOption } from '../../utils/utils';

export interface IUserPickerProps {
    inputId?: string;
    selectedUserId: number;
    label?: string;
    onChange: (userId: number) => void;
}

export const UserPicker: React.FC<IUserPickerProps> = (props) => {
    const { teamMembers, currentUser } = React.useContext(GlobalContext);

    const users: IPersonaProps[] = React.useMemo(() => {
        const all = teamMembers['All'].concat(currentUser);
        return all.map((user) => userToPeoplePickerOption(user));
    }, []);

    return (
        <>
            {props.label && <Label htmlFor={props.inputId}>{props.label || 'Assigned to'}</Label>}
            <CompactPeoplePicker
                itemLimit={1}
                inputProps={{ id: props.inputId }}
                onResolveSuggestions={(filter: string) =>
                    users.filter(
                        (user) => user.text.toLowerCase().indexOf(filter.toLowerCase()) > -1
                    )
                }
                onEmptyResolveSuggestions={() => users}
                selectedItems={users.filter((u) => u.id === props.selectedUserId.toString())}
                onChange={(items) => props.onChange(+items[0]?.id)}
            />
        </>
    );
};
