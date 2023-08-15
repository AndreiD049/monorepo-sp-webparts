import { Icon } from 'office-ui-fabric-react';
import * as React from 'react';
import { dispEvent } from '../../events';
import { TagService } from '../TagAddButton/tag-service';
import styles from './TagPill.module.scss';

export interface ITagPillProps {
    feedbackId: number;
    tag: string;
	disabled?: boolean;
}

export const TagPill: React.FC<ITagPillProps> = (props) => {
    const handleDeleteTag = async (): Promise<void> => {
        const confirmed = confirm(
            `Removing tag "${props.tag}".\nAre you sure?`
        );
        if (confirmed) {
            await TagService.removeTag(props.feedbackId, props.tag);
			dispEvent('tag-delete', { id: props.feedbackId, value: props.tag});
        }
    };

    return (
        <div className={styles.container}>
            <span>{props.tag}</span>
            <button className={styles.removeButton} onClick={handleDeleteTag} disabled={props.disabled}>
                <Icon iconName="Cancel" />
            </button>
        </div>
    );
};
