import {
    IPersonaProps,
    Panel,
    PanelType,
    Pivot,
    PivotItem,
    SearchBox,
} from 'office-ui-fabric-react';
import * as React from 'react';
import UserContext from '../../utils/UserContext';
import Folder, { siteUserInfoToPersona } from './Folder';
import IUserFolder from './IFolder';
import styles from './Folders.module.scss';
import UserService from '../../dal/Users';
import { ISiteUserInfo } from 'sp-preset';
import MissingFolder from './MissingFolder';

export interface ManageFoldersPanelProps {
    isOpen: boolean;
    setOpen: (val: boolean) => void;
}

const ManageFoldersPanel: React.FC<ManageFoldersPanelProps> = (props) => {
    const { canManageFolders, FolderService } =
        React.useContext(UserContext);
    const [folders, setFolders] = React.useState<IUserFolder[]>([]);
    const [users, setUsers] = React.useState<ISiteUserInfo[]>([]);
    const [searchValue, setSearchValue] = React.useState('');

    const personas = React.useMemo<IPersonaProps[]>(() => {
        return users.map((user) => siteUserInfoToPersona(user));
    }, [users]);

    const missingFolders = React.useMemo<ISiteUserInfo[]>(() => {
        const folderSet = new Set(folders.map((f) => f.Title));
        return users.filter((u) => !folderSet.has(u.Title));
    }, [folders, users]);

    /**
     * Folders filtered by user
     * Folders are filtered both by folder name and people who have access to this folder
     */
    const filteredFolders = React.useMemo(() => {
        const filter = searchValue.toLowerCase();
        return folders.filter((folder) => {
            if (folder.Title.toLowerCase().indexOf(filter) > -1) {
                return true;
            }
            for (let i = 0; i < folder.Users.length; i++) {
                const element = folder.Users[i];
                if (element.Title.toLowerCase().indexOf(filter) > -1) {
                    return true;
                }
            }
            return false;
        });
    }, [searchValue, folders]);

    React.useEffect(() => {
        async function run() {
            if (props.isOpen) {
                const folders = await FolderService.getUserFolders();
                setFolders(await FolderService.populateUserInfo(folders));
                const userService = new UserService();
                const users = await userService.getSiteUsers();
                setUsers(users.filter((user) => user.Email !== ''));
            }
        }
        run();
    }, [props.isOpen]);

    const handleFolderUpdate = async (id: number) => {
        const folder = await FolderService.getFolder(id);
        const userFolder = await FolderService.populateUserInfo([folder]);
        setFolders((prev) =>
            prev.map((prevFolder) =>
                prevFolder.Id === id ? userFolder[0] : prevFolder
            )
        );
    };

    const handleFolderCreated = async (id: number) => {
        const folder = await FolderService.getFolder(id);
        const userFolder = await FolderService.populateUserInfo([folder]);
        setFolders((prev) => [...prev, userFolder[0]]);
    };

    return (
        <Panel
            isLightDismiss
            isOpen={props.isOpen}
            type={PanelType.medium}
            onDismiss={() => props.setOpen(false)}
            headerText="Manage Folders"
        >
            {canManageFolders && (
                <Pivot>
                    <PivotItem headerText="Folders permissions">
                        <div className={styles.folders}>
                            <SearchBox
                                className={styles.search}
                                placeholder="Search..."
                                value={searchValue}
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                onChange={(_evt: any, val: string) =>
                                    setSearchValue(val)
                                }
                            />
                            {filteredFolders.map((folder) => (
                                <Folder
                                    key={folder.Id}
                                    folder={folder}
                                    users={personas}
                                    service={FolderService}
                                    handleFolderUpdate={handleFolderUpdate}
                                />
                            ))}
                        </div>
                    </PivotItem>
                    <PivotItem headerText="Missing folders">
                        <div className={styles.folders}>
                            {missingFolders.map((missing) => (
                                <MissingFolder
                                    key={missing.Id}
                                    user={missing}
                                    service={FolderService}
                                    handleFolderCreated={handleFolderCreated}
                                />
                            ))}
                        </div>
                    </PivotItem>
                </Pivot>
            )}
        </Panel>
    );
};

export default ManageFoldersPanel;
