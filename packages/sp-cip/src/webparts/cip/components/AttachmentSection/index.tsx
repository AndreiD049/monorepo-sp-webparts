import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import { Text } from 'office-ui-fabric-react';
import * as React from 'react';
import MainService from '../../services/main-service';
import { AttachmentsHeader } from './AttachmentsHeader';
import {
    IDropItem,
    onDragEnd,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
    SP_FILE_TYPE,
} from './drag-n-drop';
import { IAttachmentFile } from '@service/sp-cip/dist/models/IAttachmentFile';
import { IAttachments } from '@service/sp-cip/dist/models/IAttachments';
import { IAttachmentFolder } from '@service/sp-cip/dist/models/IAttachmentFolder';
import { PathBreadcrumbs } from './PathBreadcrumbs';
import { AttachmentFile } from './AttachmentFile';
import styles from './AttachmentSection.module.scss';
import { AttachmentFolder } from './AttachmentFolder';
import { loadingStart, loadingStop } from '../utils/LoadingAnimation';
import { taskUpdated } from '../../utils/dom-events';

export interface IAttachmentSectionProps {
    task: ITaskOverview;
}

export const AttachmentSection: React.FC<IAttachmentSectionProps> = (props) => {
    const [path, setPath] = React.useState<string[]>([]);
    const [savedFolders, setSavedFolders] = React.useState<{
        [key: string]: IAttachments;
    }>({});
    const [attachments, setAttachments] = React.useState<IAttachmentFile[]>([]);
    const [folders, setFolders] = React.useState<IAttachmentFolder[]>([]);
    const attachmentService = MainService.getAttachmentService();
    const taskService = MainService.getTaskService();

    React.useEffect(() => {
        const fullPath = path.join('/');
        if (savedFolders[fullPath]) {
            const atts = savedFolders[fullPath];
            setAttachments(atts.Files);
            setFolders(atts.Folders);
            return;
        }
        attachmentService.getAttachments(props.task, fullPath).then((r) => {
            setSavedFolders((prev) => ({
                ...prev,
                [path.join('/')]: r,
            }));
            setAttachments(r.Files);
            setFolders(r.Folders);
        });
    }, [path]);

    const clearPathCache = () => {
        const fullPath = path.join('/');
        setSavedFolders((prev) => ({ ...prev, [fullPath]: null }));
    };

    const handleDrop = React.useCallback(async (item: IDropItem) => {
        if (item.type !== 'file') return;
        if (Array.isArray(item.data)) {
            loadingStart('details');
            await attachmentService.addAttachments(props.task, item.data, path.join('/'));
            const latest = await taskService.attachmentsUpdated(
                props.task.Id,
                item.data.length
            );
            taskUpdated(latest);
            loadingStop('details');
            clearPathCache();
            setPath((prev) => [...prev]);
        }
    }, [path]);

    return (
        <div className={styles.container}>
            <AttachmentsHeader />
            <div
                className={`${styles.dropZone} ${styles.attachmentsBody}`}
                onDragEnter={onDragEnter}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop(handleDrop)}
                onDragEnd={onDragEnd}
                data-dropzone="true"
                data-rejects={SP_FILE_TYPE}
            >
                <PathBreadcrumbs path={path} setPath={setPath} />
                {path.length > 0 && (
                    <AttachmentFolder
                        folder={{ Name: '..' }}
                        setPath={setPath}
                    />
                )}
                {folders.map((f) => (
                    <AttachmentFolder
                        key={f.UniqueId}
                        folder={f}
                        setPath={setPath}
                    />
                ))}
                {attachments.map((a) => (
                    <AttachmentFile key={a.UniqueId} file={a} />
                ))}
            </div>
        </div>
    );
};
