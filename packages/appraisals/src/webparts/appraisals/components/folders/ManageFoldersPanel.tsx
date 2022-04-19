import { Panel, PanelType, setPortalAttribute } from 'office-ui-fabric-react';
import * as React from 'react';
import { IFolderInfo } from 'sp-preset';
import UserContext from '../../utils/UserContext';
import ManageFolderService from './folders';
import IUserFolder from './IFolder';

export interface ManageFoldersPanelProps {
    isOpen: boolean,
    setOpen: (val: boolean) => void,
} 

const ManageFoldersPanel: React.FC<ManageFoldersPanelProps> = (props) => {
    const { canManageFolders } = React.useContext(UserContext);
    const fodlerService = React.useMemo(() => new ManageFolderService(), []);
    const [folders, setFolders] = React.useState<IUserFolder[]>([]);

    React.useEffect(() => {
        async function run() {
            if (props.isOpen) {
                const folders = await fodlerService.getUserFolders();
                setFolders(await fodlerService.populateUserInfo(folders));
            }
        }
        run();
    }, [props.isOpen]);

    return (
        <Panel
            isLightDismiss
            isOpen={props.isOpen}
            type={PanelType.medium}
            onDismiss={() => props.setOpen(false)}
        >
            { canManageFolders && (
                <div>
                    <ul>
                        { folders.map((folder) => (
                            <li>{folder.Title} ({folder.Users.map((user) => user.Title).join(',')})</li>
                        )) }
                    </ul>
                </div>
            )}
        </Panel>
    )
};

export default ManageFoldersPanel;

