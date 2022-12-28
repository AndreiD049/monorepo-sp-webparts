import { IAttachmentFile } from '@service/sp-cip/dist/models/IAttachmentFile';
import {
    DefaultButton,
    Icon,
    IconButton,
    PrimaryButton,
    Text,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { Draggable } from '@rast999/drag-and-drop';
import { GlobalContext } from '../../../utils/GlobalContext';
import MainService from '../../../services/main-service';
import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import { loadingStart, loadingStop } from '../../utils/LoadingAnimation';
import styles from './AttachmentFile.module.scss';
import { taskUpdated } from '../../../utils/dom-events';
import { hideDialog, showDialog } from 'sp-components';
import { DIALOG_ID_PANEL } from '../../../utils/constants';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { getFileTypeIconProps } from '@fluentui/react-file-type-icons';

export interface IAttachmentFileProps {
    file: IAttachmentFile;
    task: ITaskOverview;
    setAttachments: React.Dispatch<React.SetStateAction<IAttachmentFile[]>>;
    folder?: string;
    onDelete: (file: IAttachmentFile) => void;
}

const getExtension = (name: string): string => {
    const tokens = name.split('.');
    return tokens[tokens.length - 1].toLowerCase();
}

export const AttachmentFile: React.FC<IAttachmentFileProps> = (props) => {
    const { properties } = React.useContext(GlobalContext);

    const handleViewFile = React.useCallback(async () => {
        const link = await MainService.getAttachmentService().getLink(
            props.file.ServerRelativeUrl
        );
        window.open(link.sharingLinkInfo.Url, '_blank', 'noreferrer');
    }, [props.file]);

    const hadnleDownload = React.useCallback(() => {
        window.open(
            `${properties.config.rootSite}/_layouts/download.aspx?SourceUrl=${props.file.ServerRelativeUrl}`,
            '_self'
        );
    }, [props.file]);

    const handleDelete = React.useCallback(async () => {
        const handleDelete = async (): Promise<void> => {
            hideDialog(DIALOG_ID_PANEL);
            const service = MainService.getAttachmentService();
            const taskService = MainService.getTaskService();
            loadingStart('details');
            await service.removeAttachment(props.file.ServerRelativeUrl);
            props.setAttachments((files) =>
                files.filter((f) => f.UniqueId !== props.file.UniqueId)
            );
            const latest = await taskService.attachmentsUpdated(
                props.task.Id,
                -1
            );
            props.onDelete(props.file);
            taskUpdated(latest);
            loadingStop('details');
        };
        showDialog({
            id: DIALOG_ID_PANEL,
            dialogProps: {
                title: 'Delete file',
                subText: `Do you really want to delete file '${props.file.Name}'?`,
            },
            footer: (
                <Stack
                    horizontal
                    horizontalAlign="end"
                    tokens={{ childrenGap: 5 }}
                >
                    <PrimaryButton onClick={handleDelete}>Yes</PrimaryButton>
                    <DefaultButton onClick={() => hideDialog(DIALOG_ID_PANEL)}>
                        No
                    </DefaultButton>
                </Stack>
            ),
        });
    }, []);

    return (
        <div className={`${styles.container}`}>
            <span onDoubleClick={handleViewFile} style={{ overflow: 'hidden' }}>
                <Draggable
                    className={styles.fileLabel}
                    type="spfile"
                    data={props.file}
                >
                    <Icon {...getFileTypeIconProps({ extension: getExtension(props.file.Name), size: 16 })} />
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
