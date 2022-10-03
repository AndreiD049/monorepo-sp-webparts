import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import * as React from 'react';
import MainService from '../../services/main-service';
import { AttachmentsHeader } from './AttachmentsHeader';
import { IAttachmentFile } from '@service/sp-cip/dist/models/IAttachmentFile';
import { IAttachmentFolder } from '@service/sp-cip/dist/models/IAttachmentFolder';
import { PathBreadcrumbs } from './PathBreadcrumbs';
import { AttachmentFile } from './AttachmentFile';
import { AttachmentFolder } from './AttachmentFolder';
import {
    loadingStart,
    loadingStop,
    withLoading,
} from '../utils/LoadingAnimation';
import { taskUpdated } from '../../utils/dom-events';
import { Droppable, IDragData } from '@rast999/drag-and-drop';
import { NewFolder } from './NewFolder';
import { getBasePath, getMovedPath, PATH_SEP } from '../../utils/path';
import { ISearchResult } from 'sp-preset';
import { SearchResults } from './SearchResults';
import { NoData } from './NoData';
import { IndexedDbCache } from 'indexeddb-manual-cache';
import { DB_NAME, MINUTE, STORE_NAME } from '../../utils/constants';
import styles from './AttachmentSection.module.scss';

export interface IAttachmentSectionProps {
    task: ITaskOverview;
}

/** Client Database cache */
export const db = new IndexedDbCache(DB_NAME, STORE_NAME, {
    expiresIn: MINUTE * 10,
});
export const cache = {
    searchAll: (taskId: number) => db.key(`searchAll${taskId}`),
};

export const AttachmentSection: React.FC<IAttachmentSectionProps> = (props) => {
    const [path, setPath] = React.useState<string[]>([]);

    const [serverRelativeUrl, setServerRelativeUrl] = React.useState('');
    const [attachments, setAttachments] = React.useState<IAttachmentFile[]>([]);
    const [folders, setFolders] = React.useState<IAttachmentFolder[]>([]);

    const [newFolder, setNewFolder] = React.useState(false);

    const attachmentService = MainService.getAttachmentService();
    const taskService = MainService.getTaskService();

    // Fetch Data
    React.useEffect(() => {
        async function run() {
            loadingStart('details');
            const fullPath = path.join('/');
            const result = await attachmentService.getAttachments(
                props.task,
                fullPath
            );
            setAttachments(result.Files);
            setFolders(result.Folders);
            if (
                serverRelativeUrl === '' &&
                (result.Files.length > 0 || result.Folders.length > 0)
            ) {
                setServerRelativeUrl(
                    result.Files.length > 0
                        ? result.Files[0].ServerRelativeUrl
                        : result.Folders[0].ServerRelativeUrl
                );
            }
            loadingStop('details');
        }
        run();
    }, [path]);

    /**
     * Check if number of attachments changed
     * Maybe, user added some attachments directly from the library.
     */
    const handleSync = React.useCallback(async () => {
        if (serverRelativeUrl === '') return;
        const results = (
            await attachmentService.searchInFolder(
                '',
                props.task,
                location.origin + getBasePath(serverRelativeUrl)
            )
        ).TotalRowsIncludingDuplicates;

        const delta = results - props.task.AttachmentsCount;
        if (delta !== 0) {
            // update number of attachments
            const latest = await taskService.attachmentsUpdated(
                props.task.Id,
                delta
            );
            taskUpdated(latest);
        }
    }, [serverRelativeUrl]);

    /** Attach via button */
    const handleAttach = async (files: File[]) => {
        try {
            loadingStart('details');
            await handleSync();
            await attachmentService.addAttachments(
                props.task,
                files,
                path.join('/')
            );
            const latest = await taskService.attachmentsUpdated(
                props.task.Id,
                files.length
            );
            await cache
                .searchAll(props.task.Id)
                .update<number>(() => latest.AttachmentsCount);
            taskUpdated(latest);
        } finally {
            loadingStop('details');
            setPath((prev) => [...prev]);
        }
    };

    /** Attach by dropping */ 
    const handleDrop =
        (currentPath: string[] = path) =>
        async (data: IDragData<any>) => {
            if (!data.files.length) return;
            try {
                loadingStart('details');
                await handleSync();
                await attachmentService.addAttachments(
                    props.task,
                    data.files,
                    currentPath.join('/')
                );
                const latest = await taskService.attachmentsUpdated(
                    props.task.Id,
                    data.files.length
                );
                await cache
                    .searchAll(props.task.Id)
                    .update<number>(() => latest.AttachmentsCount);
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

    const handleDelete = React.useCallback(
        async (file: IAttachmentFile) => {
            await cache
                .searchAll(props.task.Id)
                .update<number>((prev) => prev - 1);
        },
        [props.task]
    );

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
                    location.origin + getBasePath(serverRelativeUrl)
                );
                setSearchResults(results.PrimarySearchResults);
            } finally {
                loadingStop('details');
            }
        },
        [props.task, attachments, folders, serverRelativeUrl]
    );

    const hasResults =
        attachments.length > 0 || folders.length > 0 || path.length > 0;

    let body = null;
    if (searchResults?.length >= 0) {
        body = (
            <SearchResults
                results={searchResults}
                task={props.task}
                onDelete={async (file) => {
                    await handleDelete(file);
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
                        onDelete={async (file) => handleDelete(file)}
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
                onSync={() => withLoading('details', handleSync)}
            />
            {body}
        </Droppable>
    );
};
