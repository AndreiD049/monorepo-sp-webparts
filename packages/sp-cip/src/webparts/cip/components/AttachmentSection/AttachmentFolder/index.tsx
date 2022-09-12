import { IAttachmentFile } from '@service/sp-cip/dist/models/IAttachmentFile';
import { IAttachmentFolder } from '@service/sp-cip/dist/models/IAttachmentFolder';
import { Icon, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { onDragEnd, onDragEnter, onDragLeave, onDragOver, onDrop, SP_FILE_TYPE } from '../drag-n-drop';
import styles from './AttachmentFolder.module.scss';

export interface IAttachmentFolderProps {
    folder: Partial<IAttachmentFolder>;
    setPath: React.Dispatch<React.SetStateAction<string[]>>;
}

export const AttachmentFolder: React.FC<IAttachmentFolderProps> = (props) => {
    const handleDoubleClick = React.useCallback((evt: React.MouseEvent) => {
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
    }, [props.folder, props.setPath]);

    return (
        <div 
            className={`${styles.container}`}
            onDragEnter={onDragEnter}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop((item) => console.log(item))}
            onDragEnd={onDragEnd}
            onDoubleClick={handleDoubleClick}
            data-dropzone="true"
        >
            <Icon iconName='Folder' />
            <Text variant='medium'>{props.folder.Name}</Text>
        </div>
    );
};
