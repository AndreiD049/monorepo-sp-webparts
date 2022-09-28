import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import * as React from 'react';
import MainService from '../../services/main-service';
import { AttachmentsHeader } from './AttachmentsHeader';
import { IAttachmentFile } from '@service/sp-cip/dist/models/IAttachmentFile';
import { IAttachmentFolder } from '@service/sp-cip/dist/models/IAttachmentFolder';
import { PathBreadcrumbs } from './PathBreadcrumbs';
import { AttachmentFile } from './AttachmentFile';
import { AttachmentFolder } from './AttachmentFolder';
import { loadingStart, loadingStop } from '../utils/LoadingAnimation';
import { taskUpdated } from '../../utils/dom-events';
import { Droppable, IDragData } from '@rast999/drag-and-drop';
import { NewFolder } from './NewFolder';
import { getBasePath, getMovedPath, PATH_SEP } from '../../utils/path';
import { ISearchResult } from 'sp-preset';
import { SearchResults } from './SearchResults';
import { NoData } from './NoData';
import styles from './AttachmentSection.module.scss';

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

    // Fetch Data
    React.useEffect(() => {
        setAttachments([]);
        setFolders([]);
        const fullPath = path.join('/');
        attachmentService.getAttachments(props.task, fullPath).then((r) => {
            setAttachments(r.Files);
            setFolders(r.Folders);
        });
    }, [path]);

    const handleAttach = async (files: File[]) => {
        try {
            loadingStart('details');
            await attachmentService.addAttachments(
                props.task,
                files,
                path.join('/')
            );
            const latest = await taskService.attachmentsUpdated(
                props.task.Id,
                files.length
            );
            taskUpdated(latest);
        } finally {
            loadingStop('details');
            setPath((prev) => [...prev]);
        }
    };

    // Drop file
    const handleDrop =
        (currentPath: string[] = path) =>
        async (data: IDragData<any>) => {
            if (!data.files.length) return;
            try {
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
            } finally {
                loadingStop('details');
                setPath((prev) => [...prev]);
            }
        };

    // Move file by dragging
    const handleFileMove =
        (folder: string) => async (data: IDragData<IAttachmentFile>) => {
            try {
                loadingStart('details');
                if (data.files.length) return;
                // For now, we will handle only 'one by one' file moves
                const attachment = data.items[0];
                const pathFrom = attachment.ServerRelativeUrl;
                const movedPath = getMovedPath(pathFrom, folder);
                await attachmentService.moveAttachment(pathFrom, movedPath);
                const pathFromTokens = pathFrom.split(PATH_SEP);
                setPath((prev) => [...prev]);
                setAttachments((att) =>
                    att.filter((a) => a.UniqueId !== attachment.UniqueId)
                );
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
            setPath((path) => [...path]);
            setNewFolder(false);
        },
        [newFolder]
    );

    /** Search handling */
    const [searchResults, setSearchResults] = React.useState<
        ISearchResult[] | null
    >(null);
    const handleSearch = React.useCallback(
        async (value: string) => {
            try {
                loadingStart('details');
                if (!value) return setSearchResults(null);
                if (attachments.length === 0 && folders.length === 0) return;
                const results = await attachmentService.searchInFolder(
                    value,
                    props.task,
                    location.origin +
                        getBasePath(
                            attachments.length > 0
                                ? attachments[0].ServerRelativeUrl
                                : folders[0].ServerRelativeUrl
                        )
                );
                setSearchResults(results.PrimarySearchResults);
            } finally {
                loadingStop('details');
            }
        },
        [props.task, attachments, folders]
    );

    const hasResults = attachments.length > 0 || folders.length > 0 || path.length > 0;

    let body = null;
    if (searchResults?.length >= 0) {
        body = (
            <SearchResults
                results={searchResults}
                task={props.task}
                onDelete={(file) => {
                    console.log(file);
                    setSearchResults((prev) =>
                        prev.filter((p) => p.UniqueId !== file.UniqueId)
                    );
                }}
            />
        );
    } else if (hasResults || newFolder) {
        body = (
            <>
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
                        onDelete={() => null}
                    />
                ))}
            </>
        );
    } else {
        body = <NoData />;
    }

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
            <AttachmentsHeader
                task={props.task}
                path={path.join(PATH_SEP)}
                setNewFolder={setNewFolder}
                onSearch={handleSearch}
                onAttach={handleAttach}
            />
            {body}
        </Droppable>
    );
};
