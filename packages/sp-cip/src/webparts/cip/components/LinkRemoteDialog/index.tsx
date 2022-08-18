import { Dropdown } from 'office-ui-fabric-react';
import * as React from 'react';
import MainService from '../../services/main-service';
import { TaskService } from '../../services/task-service';
import { GlobalContext } from '../../utils/GlobalContext';
import styles from './LinkRemoteDialog.module.scss';

export interface ILinkRemoteDialogProps {
    // Props go here
}

export const LinkRemoteDialog: React.FC<ILinkRemoteDialogProps> = (props) => {
    const { properties } = React.useContext(GlobalContext);
    const [selectedRemote, setSelectedRemote] = React.useState<IRemoteSource>(null);
    const [remoteItems, setRemoteItems] = React.useState([]);

    const options = React.useMemo(() => {
        return properties.remoteSources.map((source) => ({
            key: source.Name,
            text: source.Name,
            data: source
        }));
    }, [properties]);

    React.useEffect(() => {
        async function run() {
            if (selectedRemote) {
                const taskService = MainService.getTaskService(selectedRemote?.Name);
                setRemoteItems(await taskService.getAllMains());
            }
        };
        run();
    }, [selectedRemote]);

    return (
        <div className={styles.container}>
            <Dropdown 
                label='Remote'
                options={options}
                selectedKey={selectedRemote?.Name}
                onChange={(ev, opt) => setSelectedRemote(opt.data)}
            />
            {
                remoteItems.map((i) => (<div>{i.Title}</div>))
            }
        </div>
    );
};
