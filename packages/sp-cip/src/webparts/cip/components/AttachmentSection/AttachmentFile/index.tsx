import { IAttachmentFile } from '@service/sp-cip/dist/models/IAttachmentFile';
import { Icon, IconButton, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { onDragStart } from '../drag-n-drop';
import styles from './AttachmentFile.module.scss';

export interface IAttachmentFileProps {
    file: IAttachmentFile;
}

const getFileIconName = (name: string) => {
    const tokens = name.split('.');
    const extension = tokens[tokens.length - 1].toLowerCase();
    switch (extension) {
        case 'xls':
        case 'xlsx':
        case 'xltx':
        case 'xltm':
        case 'xlsb':
        case 'xlam':
        case 'xlsm':
            return 'ExcelDocument';
        case 'docx':
        case 'docm':
        case 'doc':
        case 'dot':
        case 'odt':
        case 'wps':
        case 'xps':
        case 'dotm':
        case 'dotx':
        case 'rtf':
            return 'WordDocument';
        case 'pdf':
            return 'PDF';
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'tiff':
        case 'psd':
        case 'bmp':
        case 'eps':
            return 'FileImage';
        case 'html':
        case 'htm':
        case 'mht':
        case 'mhtml':
        case 'xml':
        case 'xsl':
        case 'xslt':
            return 'FileHTML';
        case 'pptx':
        case 'pptm':
        case 'potx':
        case 'potm':
        case 'ppam':
        case 'ppsx':
        case 'ppsm':
        case 'sldx':
        case 'sldm':
        case 'thmx':
            return 'PowerPointLogo';
        case 'txt':
            return 'FileCSS';
        default:
            return 'FileTemplate';
    }
};

export const AttachmentFile: React.FC<IAttachmentFileProps> = (props) => {
    return (
        <div className={`${styles.container}`}>
            <div
                className={styles.fileLabel}
                draggable
                onDragStart={onDragStart(props.file)}
            >
                <Icon iconName={getFileIconName(props.file.Name)} />
                <Text
                    styles={{
                        root: {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        },
                    }}
                    title={props.file.Name}
                    variant="medium"
                >
                    {props.file.Name}
                </Text>
            </div>
            <div className={styles.fileControlBar}>
                <IconButton
                    className={styles.fileControlBarButton}
                    iconProps={{ iconName: 'View' }}
                />
                <IconButton
                    className={styles.fileControlBarButton}
                    iconProps={{ iconName: 'Edit' }}
                />
                <IconButton
                    className={styles.fileControlBarButton}
                    iconProps={{ iconName: 'Delete' }}
                />
            </div>
        </div>
    );
};
