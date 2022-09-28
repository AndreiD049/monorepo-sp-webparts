import { ITextField } from '@microsoft/office-ui-fabric-react-bundle';
import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import { IconButton, TextField } from 'office-ui-fabric-react';
import * as React from 'react';
import styles from './NewFolder.module.scss';

export interface INewFolderProps {
    onSave: (folderName: string) => void;
    onCancel: () => void;
    task: ITaskOverview;
    folder: string;
}

export const NewFolder: React.FC<INewFolderProps> = (props) => {
    const [folderName, setFolderName] = React.useState('');
    const ref = React.useRef<ITextField>(null);

    React.useEffect(() => {
        ref.current.focus();
    }, [ref]);

    return (
        <div className={styles.container}>
            <TextField
                componentRef={ref}
                value={folderName}
                onChange={(_e: {}, val: string) => setFolderName(val)}
                placeholder="New folder name"
                className={styles.textField}
            />
            <IconButton
                iconProps={{
                    iconName: 'Save',
                }}
                onClick={() => props.onSave(folderName)}
            />
            <IconButton
                iconProps={{
                    iconName: 'ChromeClose',
                }}
                onClick={props.onCancel}
            />
        </div>
    );
};
