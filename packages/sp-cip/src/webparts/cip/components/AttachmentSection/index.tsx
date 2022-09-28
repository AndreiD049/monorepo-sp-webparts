import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import * as React from 'react';
import MainService from '../../services/main-service';
import { AttachmentsHeader } from './AttachmentsHeader';
import { IAttachmentFile } from '@service/sp-cip/dist/models/IAttachmentFile';
import { IAttachments } from '@service/sp-cip/dist/models/IAttachments';
import { IAttachmentFolder } from '@service/sp-cip/dist/models/IAttachmentFolder';
import { PathBreadcrumbs } from './PathBreadcrumbs';
import { AttachmentFile } from './AttachmentFile';
import { AttachmentFolder } from './AttachmentFolder';
import { loadingStart, loadingStop } from '../utils/LoadingAnimation';
import { taskUpdated } from '../../utils/dom-events';
import { Droppable, IDragData } from '@rast999/drag-and-drop';
import styles from './AttachmentSection.module.scss';
import { NewFolder } from './NewFolder';
import { getMovedPath } from '../../utils/path';

export interface IAttachmentSectionProps {
    task: ITaskOverview;
}

export async function addFilesToFolder(
    data: IDragData<any>,
    task: ITaskOverview,
    path: string = ''
) {}

export const AttachmentSection: React.FC<IAttachmentSectionProps> = (props) => {
    const [path, setPath] = React.useState<string[]>([]);
    const [attachments, setAttachments] = React.useState<IAttachmentFile[]>([]);
    const [folders, setFolders] = React.useState<IAttachmentFolder[]>([]);
    const [newFolder, setNewFolder] = React.useState(false);
    const attachmentService = MainService.getAttachmentService();
    const taskService = MainService.getTaskService();
    
    // in-memory cache of files
    const [savedFolders, setSavedFolders] = React.useState<{
        [key: string]: IAttachments;
    }>({});
    const clearPathCache = (toClearPath: string[] = path) => {
        const fullPath = toClearPath.join('/');
        setSavedFolders((prev) => ({ ...prev, [fullPath]: null }));
    };

    // Fetch Data
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

    // Drop file
    const handleDrop =
        (currentPath: string[] = path) =>
        async (data: IDragData<any>) => {
            if (!data.files.length) return;
            loadingStart('details');
            await attachmentService.addAttachments(
                props.task,
                data.files,
                currentPath.join('/')
            );
            const latest = await taskService.attachmentsUpdated(
                props.task.Id,
                data.files.length
            );
            taskUpdated(latest);
            loadingStop('details');
            clearPathCache(currentPath);
            setPath((prev) => [...prev]);
        };

    // Move file by dragging
    const handleFileMove = (folder: string) => async (data: IDragData<IAttachmentFile>) => {
        try {
            loadingStart('details');
            if (data.files.length) return;
            // For now, we will handle only 'one by one' file moves
            const attachment = data.items[0];
            const pathFrom = attachment.ServerRelativeUrl;
            const movedPath = getMovedPath(pathFrom, folder);
            await attachmentService.moveAttachment(pathFrom, movedPath);
            clearPathCache(path);
            clearPathCache(movedPath.split('/').slice(0, -1));
            setAttachments((att) => att.filter((a) => a.UniqueId !== attachment.UniqueId));
        } finally {
            loadingStop('details');
        }
    };

    // Create new folder
    const handleSaveNewFolder = React.useCallback(
        async (name: string) => {
            loadingStart('details');
            await attachmentService.addFolder(props.task, name, path.join('/'));
            loadingStop('details');
            setSavedFolders((prev) => ({
                ...prev,
                [path.join('/')]: null,
            }));
            setPath((path) => [...path]);
            setNewFolder(false);
        },
        [newFolder]
    );

    /** test */
    React.useEffect(() => {
        async function run() {
            if (attachments.length > 0) {
                const results = await attachmentService.searchInFolder('rate', props.task, location.origin + attachments[0].ServerRelativeUrl.split('/').slice(0, -1).join('/'));
                console.log(results.PrimarySearchResults);
                console.log(results.TotalRows);
            }
        }
        run();
    }, [attachments]);

    return (
        <Droppable
            className={styles.container}
            handleDrop={handleDrop(path)}
            handleEnter={(data) => {
                data.dropzone.classList.add(styles.dropzoneDraggingOver);
            }}
            handleLeave={(data) => {
                data.dropzone.classList.remove(styles.dropzoneDraggingOver);
            }}
            allowedTypes={['file']}
        >
            <AttachmentsHeader task={props.task} setNewFolder={setNewFolder} />
            <PathBreadcrumbs path={path} setPath={setPath} />
            {newFolder && (
                <NewFolder
                    task={props.task}
                    folder={path.join('/')}
                    onSave={handleSaveNewFolder}
                    onCancel={() => setNewFolder(false)}
                />
            )}
            {path.length > 0 && (
                <AttachmentFolder
                    folder={{ Name: '..' }}
                    path={path.join('/')}
                    setPath={setPath}
                    task={props.task}
                    handleFileDrop={handleDrop(path.slice(0, -1))}
                    handleFileMove={handleFileMove('..')}
                />
            )}
            {folders.map((f) => (
                <AttachmentFolder
                    key={f.UniqueId}
                    folder={f}
                    path={path.join('/')}
                    setPath={setPath}
                    task={props.task}
                    handleFileDrop={handleDrop([...path, f.Name])}
                    handleFileMove={handleFileMove(f.Name)}
                />
            ))}
            {attachments.map((a) => (
                <AttachmentFile
                    key={a.UniqueId}
                    file={a}
                    task={props.task}
                    setAttachments={setAttachments}
                    folder={path.join('/')}
                />
            ))}
        </Droppable>
    );
};
