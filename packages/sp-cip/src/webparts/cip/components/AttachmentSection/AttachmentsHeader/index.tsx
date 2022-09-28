import { ActionButton, SearchBox } from 'office-ui-fabric-react';
import * as React from 'react';
import styles from './AttachmentsHeader.module.scss';

export interface IAttachmentsHeaderProps {
    // Props go here
}

export const AttachmentsHeader: React.FC<IAttachmentsHeaderProps> = (props) => {
    return (
        <div className={styles.container}>
            <div>
                <ActionButton
                    styles={{ label: { fontSize: '.65em' } }}
                    className={styles.headerActionButton}
                    iconProps={{ iconName: 'Add' }}
                >
                    Folder
                </ActionButton>
                <ActionButton
                    styles={{ label: { fontSize: '.65em' } }}
                    className={styles.headerActionButton}
                    iconProps={{ iconName: 'Go' }}
                >
                    Open
                </ActionButton>
                <ActionButton
                    styles={{ label: { fontSize: '.65em' } }}
                    className={styles.headerActionButton}
                    iconProps={{ iconName: 'Move' }}
                >
                    Move
                </ActionButton>
                <ActionButton
                    styles={{ label: { fontSize: '.65em' } }}
                    className={styles.headerActionButton}
                    iconProps={{ iconName: 'Delete' }}
                >
                    Delete
                </ActionButton>
            </div>
            <div>
                <SearchBox
                    className={styles.headerSearchBar}
                    placeholder="Search"
                />
            </div>
        </div>
    );
};
