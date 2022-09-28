import { debounce } from '@microsoft/sp-lodash-subset';
import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import { ActionButton, SearchBox } from 'office-ui-fabric-react';
import * as React from 'react';
import MainService from '../../../services/main-service';
import styles from './AttachmentsHeader.module.scss';

export interface IAttachmentsHeaderProps {
    task: ITaskOverview;
    setNewFolder: React.Dispatch<React.SetStateAction<boolean>>
    onSearch: (searchValue: string) => void;
    onAttach: (files: File[]) => void;
    path?: string;
}

export const AttachmentsHeader: React.FC<IAttachmentsHeaderProps> = (props) => {
    const attachmentService = React.useMemo(() => MainService.getAttachmentService(), []);
    const hadnleSearch = React.useCallback(debounce((value: string) => {
        props.onSearch(value);
    }, 1000), [props.onSearch]);
    const inputRef = React.useRef(null);

    return (
        <div className={styles.container}>
            <div>
                <ActionButton
                    className={styles.headerActionButton}
                    iconProps={{ iconName: 'Add' }}
                    onClick={() => { props.setNewFolder(true) }}
                >
                    New Folder
                </ActionButton>
                <ActionButton
                    className={styles.headerActionButton}
                    iconProps={{ iconName: 'SharepointAppIcon16' }}
                    onClick={async () => { window.open((await attachmentService.getTaskFolder(props.task, props.path)).ServerRelativeUrl, '_blank'); }}
                >
                    Open Library
                </ActionButton>
                <ActionButton
                    className={styles.headerActionButton}
                    iconProps={{ iconName: 'Attach' }}
                    onClick={() => inputRef.current && inputRef.current.click()}
                >
                    Attach
                </ActionButton>
            </div>
            <div>
                <SearchBox
                    className={styles.headerSearchBar}
                    placeholder="Search"
                    onChange={(_ev, value) => hadnleSearch(value)}
                />
            </div>
            <input ref={inputRef} onChange={(evt) => props.onAttach(Array.from(evt.target.files))} type='file' style={{ display: 'none' }} />
        </div>
    );
};
