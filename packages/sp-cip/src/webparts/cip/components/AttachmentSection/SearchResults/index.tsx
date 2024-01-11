import { IAttachmentFile } from '@service/sp-cip/dist/models/IAttachmentFile';
import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import { Separator, Text } from '@fluentui/react';
import * as React from 'react';
import { ISearchResult } from 'sp-preset';
import { getFileName } from '../../../utils/path';
import { AttachmentFile } from '../AttachmentFile';
import styles from './SearchResults.module.scss';

export interface ISearchResultsProps {
    results: ISearchResult[];
    task: ITaskOverview;
    onDelete: (file: IAttachmentFile) => void;
}

const convertResultToFile = (result: ISearchResult): IAttachmentFile => {
    const fileName = getFileName(result.Path || result.OriginalPath, result.FileType);
    return {
        Length: result.Size.toString(),
        Name: `${fileName}`,
        ServerRelativeUrl: result.ParentLink.replace(location.origin, '') + `/${fileName}`,
        TimeCreated: result.LastModifiedTime.toString(),
        TimeLastModified: result.LastModifiedTime.toString(),
        UniqueId: result.UniqueId,
    }
}

export const SearchResults: React.FC<ISearchResultsProps> = (props) => {
    const files = React.useMemo(() => {
        return props.results.map((r) => convertResultToFile(r));
    }, [props.results]);

    return (
        <div className={styles.container}>
            <Text className={styles.label} variant='large'>Search results - {props.results.length} {props.results.length === 1 ? 'file' : 'files'}:</Text>
            <Separator />
            {files.map((f) => (
                <AttachmentFile
                    file={f}
                    setAttachments={() => null}
                    task={props.task}
                    folder={'test'}
                    key={f.UniqueId}
                    onDelete={props.onDelete}
                />
            ))}
        </div>
    );
};
