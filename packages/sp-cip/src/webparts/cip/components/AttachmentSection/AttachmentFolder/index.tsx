import { IAttachmentFolder } from '@service/sp-cip/dist/models/IAttachmentFolder';
import { Icon, Text } from '@fluentui/react';
import * as React from 'react';
import styles from './AttachmentFolder.module.scss';
import dropzoneStyles from '../AttachmentSection.module.scss';
import { Droppable, IDragData } from '@rast999/drag-and-drop';
import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import { IAttachmentFile } from '@service/sp-cip/dist/models/IAttachmentFile';
import { loadingStart, loadingStop } from '../../utils/LoadingAnimation';
import { UserHandler } from '@rast999/drag-and-drop/dist/utils';
import { PATH_BACK } from '../../../utils/path';
import { FileIconType, getFileTypeIconProps } from '@fluentui/react-file-type-icons';

export interface IAttachmentFolderProps {
    folder: Partial<IAttachmentFolder>;
    task: ITaskOverview;
    setPath: React.Dispatch<React.SetStateAction<string[]>>;
    path: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            if (data.files.length) {
                await props.handleFileDrop(data);
            } else {
                await props.handleFileMove(data);
            }
        } finally {
            loadingStop('details');
        }
    }, []);

    let childItemLabel = null;
    if (props.folder.Name !== PATH_BACK) {
        childItemLabel = (<span> ({props.folder.ItemCount})</span>);
    }

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
                <Icon {...getFileTypeIconProps({ type: FileIconType.folder, size: 16 })} />
                <Text variant="medium">{props.folder.Name}{childItemLabel}</Text>
            </div>
        </Droppable>
    );
};
