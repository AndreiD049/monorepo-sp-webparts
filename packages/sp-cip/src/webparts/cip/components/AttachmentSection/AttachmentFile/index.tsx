import { IAttachmentFile } from '@service/sp-cip/dist/models/IAttachmentFile';
import { ButtonType, Icon, IconButton, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { Draggable } from '@rast999/drag-and-drop';
import { GlobalContext } from '../../../utils/GlobalContext';
import MainService from '../../../services/main-service';
import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import { loadingStart, loadingStop } from '../../utils/LoadingAnimation';
import styles from './AttachmentFile.module.scss';
import { taskUpdated } from '../../../utils/dom-events';
import { getBasePath } from '../../../utils/path';
import { DIALOG_IDS, getDialog } from '../../AlertDialog';

export interface IAttachmentFileProps {
    file: IAttachmentFile;
    task: ITaskOverview;
    setAttachments: React.Dispatch<React.SetStateAction<IAttachmentFile[]>>;
    folder?: string;
    onDelete: (file: IAttachmentFile) => void;
}

const getFileIconName = (name: string): string => {
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

const getRootSite = (serverRelativeUrl: string, libraryName: string): string => {
    const rootSiteParts = serverRelativeUrl.split('/');
    const libraryIndex = rootSiteParts.indexOf(libraryName);
    return rootSiteParts.slice(0, libraryIndex + 1).join('/');
};

export const AttachmentFile: React.FC<IAttachmentFileProps> = (props) => {
    const { properties } = React.useContext(GlobalContext);
    const rootSite = React.useMemo(
        () =>
            getRootSite(
                props.file.ServerRelativeUrl,
                properties.config.attachmentsPath
            ),
        [props.file]
    );

    const handleViewFile = React.useCallback(() => {
        window.open(
            rootSite +
                '/Forms/AllItems.aspx?id=' +
                props.file.ServerRelativeUrl +
                '&parent=' +
                getBasePath(props.file.ServerRelativeUrl),
            '_blank',
            'noreferrer'
        );
    }, [props.file]);

    const hadnleDownload = React.useCallback(() => {
        window.open(
            `${properties.config.rootSite}/_layouts/download.aspx?SourceUrl=${props.file.ServerRelativeUrl}`,
            '_self'
        );
    }, [props.file]);

    const handleDelete = React.useCallback(async () => {
        console.log(props.file);
        const answer = await getDialog({
            alertId: DIALOG_IDS.DETAILS_PANEL,
            title: 'Delete file?',
            subText: `Do you really want to delete file '${props.file.Name}'?`,
            buttons: [
                {
                    key: 'yes',
                    text: 'Yes',
                    type: ButtonType.primary,
                },
                {
                    key: 'no',
                    text: 'No',
                    type: ButtonType.default,
                },
            ],
        });
        if (answer === 'no' || !answer) return;
        const service = MainService.getAttachmentService();
        const taskService = MainService.getTaskService();
        loadingStart('details');
        await service.removeAttachment(props.file.ServerRelativeUrl);
        props.setAttachments((files) =>
            files.filter((f) => f.UniqueId !== props.file.UniqueId)
        );
        const latest = await taskService.attachmentsUpdated(props.task.Id, -1);
        props.onDelete(props.file);
        taskUpdated(latest);
        loadingStop('details');
    }, []);

    return (
        <div className={`${styles.container}`}>
            <span onDoubleClick={handleViewFile} style={{ overflow: 'hidden' }}>
                <Draggable
                    className={styles.fileLabel}
                    type="spfile"
                    data={props.file}
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
                </Draggable>
            </span>
            <div className={styles.fileControlBar}>
                <IconButton
                    className={styles.fileControlBarButton}
                    iconProps={{ iconName: 'View' }}
                    onClick={handleViewFile}
                />
                <IconButton
                    className={styles.fileControlBarButton}
                    iconProps={{ iconName: 'Download' }}
                    onClick={hadnleDownload}
                />
                <IconButton
                    className={styles.fileControlBarButton}
                    iconProps={{ iconName: 'Delete' }}
                    onClick={handleDelete}
                />
            </div>
        </div>
    );
};
