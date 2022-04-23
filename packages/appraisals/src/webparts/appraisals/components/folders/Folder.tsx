import * as React from 'react';
import IUserFolder from './IFolder';
import styles from './Folders.module.scss';
import {
    CompactPeoplePicker,
    Icon,
    IPersonaProps,
    PersonaCoin,
    Text,
} from 'office-ui-fabric-react';
import { IconButton } from '@microsoft/office-ui-fabric-react-bundle';
import { ISiteUserInfo } from 'sp-preset';
import ManageFolderService from './folder-service';
import UserContext from '../../utils/UserContext';

export interface IFolderProps extends React.DOMAttributes<HTMLDivElement> {
    folder: IUserFolder;
    users: IPersonaProps[];
    service: ManageFolderService;
    handleFolderUpdate: (id: number) => void;
}

export function siteUserInfoToPersona(user: ISiteUserInfo) {
    return {
        id: user.Id.toString(),
        text: user.Title,
        secondaryText: user.Email,
        imageUrl: `/_layouts/15/userphoto.aspx?size=S&username=${user.Email}`,
    };
}

const Folder: React.FC<IFolderProps> = (props) => {
    const { defaultFolderRole } = React.useContext(UserContext);
    const [editable, setEditable] = React.useState<boolean>(false);
    const [selectedUsers, setSelectedUsers] = React.useState<IPersonaProps[]>(
        props.folder.Users.map((user) => siteUserInfoToPersona(user))
    );

    const handleSelectedChange = async (
        prev: IPersonaProps[],
        current: IPersonaProps[]
    ) => {
        // make a set of new items to determine the removed items
        const currentSet = new Set(current.map((i) => i.id));
        const prevSet = new Set(prev.map((i) => i.id));
        const removed = prev.filter((item) => !currentSet.has(item.id));
        // handle removed items
        const callsRemoved = removed.map(async (item) => {
            return props.service.removeUserFromFolder(
                +item.id,
                props.folder.Id
            );
        });
        await Promise.all(callsRemoved);

        const added = current.filter((item) => !prevSet.has(item.id));
        // handle added items
        const callsAdded = added.map(async (item) => {
            return props.service.assignUserToFolder(
                +item.id,
                props.folder.Id,
                defaultFolderRole
            );
        });

        await Promise.all(callsAdded);

        setSelectedUsers(current);
    };

    const handleFilterUser = (filter: string, selected: IPersonaProps[]) => {
        const set = new Set(selected.map((s) => s.id));
        const filterLower = filter.toLowerCase();
        return props.users.filter(
            (user) =>
                user.text.toLowerCase().indexOf(filterLower) > -1 &&
                !set.has(user.id)
        );
    };

    const userList = React.useMemo(() => {
        if (editable) {
            return (
                <div>
                    <CompactPeoplePicker
                        onResolveSuggestions={handleFilterUser}
                        onEmptyResolveSuggestions={() =>
                            handleFilterUser('', selectedUsers)
                        }
                        selectedItems={selectedUsers}
                        onChange={async (items) => {
                            await handleSelectedChange(selectedUsers, items);
                        }}
                    />
                </div>
            );
        } else {
            return (
                <div>
                    {props.folder.Users.map((user) => user.Title).join(', ')}
                </div>
            );
        }
    }, [editable, selectedUsers]);

    const icon = React.useMemo(() => {
        return (
            <IconButton
                iconProps={{ iconName: editable ? 'CheckMark' : 'Edit' }}
                onClick={async () => {
                    if (editable) {
                        await props.handleFolderUpdate(props.folder.Id);
                        setEditable(false);
                    } else {
                        setEditable(true);
                    }
                }}
            />
        );
    }, [editable]);

    return (
        <div className={styles.folder}>
            <div className={styles.innerWrapper}>
                <PersonaCoin
                    className={styles.coin}
                    imageInitials={props.folder.Title.substring(0, 2)}
                    imageUrl={`/_layouts/15/userphoto.aspx?size=S&username=${props.folder.folderUser?.Email}`}
                />
                <div className={styles.content}>
                    <div className={styles.firstRow}>
                        <Text variant="mediumPlus" className={styles.userTitle}>
                            {props.folder.Title}
                        </Text>
                        {icon}
                    </div>
                    {userList}
                </div>
            </div>
        </div>
    );
};

export default Folder;
