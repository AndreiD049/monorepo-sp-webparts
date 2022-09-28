import { IAttachmentFolder } from '@service/sp-cip/dist/models/IAttachmentFolder';
import { Icon, IconButton, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import styles from './AttachmentFolder.module.scss';
import dropzoneStyles from '../AttachmentSection.module.scss';
import { Droppable, IDragData } from '@rast999/drag-and-drop';
import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import MainService from '../../../services/main-service';
import { IAttachmentFile } from '@service/sp-cip/dist/models/IAttachmentFile';
import { loadingStart, loadingStop } from '../../utils/LoadingAnimation';
import { UserHandler } from '@rast999/drag-and-drop/dist/utils';

export interface IAttachmentFolderProps {
    folder: Partial<IAttachmentFolder>;
    task: ITaskOverview;
    setPath: React.Dispatch<React.SetStateAction<string[]>>;
    path: string;
    handleFileDrop: UserHandler<any>;
    handleFileMove: UserHandler<IAttachmentFile>;
}

export const AttachmentFolder: React.FC<IAttachmentFolderProps> = (props) => {
    const handleDoubleClick = React.useCallback(
        (evt: React.MouseEvent) => {
            props.setPath((prev) => {
                const copy = [...prev];
                if (props.folder.Name === '..') {
                    copy.pop();
                } else {
                    copy.push(props.folder.Name);
                }
                return copy;
            });
            document.getSelection().empty();
        },
        [props.folder, props.setPath]
    );

    const handleDrop = React.useCallback(async (data: IDragData<IAttachmentFile>) => {
        try {
            loadingStart('details');
            console.log(data);
            if (data.files.length) {
                await props.handleFileDrop(data);
            } else {
                await props.handleFileMove(data);
            }
        } finally {
            loadingStop('details');
        }
    }, []);

    return (
        <Droppable
            handleDrop={handleDrop}
            handleEnter={(data) =>
                data.dropzone.classList.add(dropzoneStyles.dropzoneDraggingOver)
            }
            handleLeave={(data) =>
                data.dropzone.classList.remove(
                    dropzoneStyles.dropzoneDraggingOver
                )
            }
        >
            <div
                className={`${styles.container}`}
                onDoubleClick={handleDoubleClick}
            >
                <Icon iconName="Folder" />
                <Text variant="medium">{props.folder.Name}</Text>
            </div>
        </Droppable>
    );
};
