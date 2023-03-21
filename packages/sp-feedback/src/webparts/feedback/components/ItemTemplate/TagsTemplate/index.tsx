import { IconButton } from 'office-ui-fabric-react';
import * as React from 'react';
import { $eq } from '../../../indexes/filter';
import { IndexManager } from '../../../indexes/index-manager';
import { Item } from '../../../item';
import { GlobalContext } from '../../Feedback';
import {
    hideListOptionsCallout,
    IListOption,
    makeSimpleListOption,
    showListOptionsCallout,
} from '../../OptionList';
import { showModal } from '../ItemModal';
import styles from './TagsTemplate.module.scss';

export interface ITagsTemplateProps {
    tags: string[];
    setItem: React.Dispatch<React.SetStateAction<Item>>;
    editable: boolean;
}

const removeTag = (item: Item, tag: string): Item => {
    const oldTags: string[] = item.getFieldOr('tags', []);
    const newTags = oldTags.filter((t) => t !== tag);
    return item.setTags(newTags);
};

const getItemsTaggedWith = (indexManager: IndexManager, tag: string): Item[] => {
    return indexManager.filterArray($eq('tag', tag));
}

const Tag: React.FC<{
    tag: string;
    editable: boolean;
    setItem?: ITagsTemplateProps['setItem'];
}> = (props) => {
    const { indexManager } = React.useContext(GlobalContext);
    const target = React.useRef<HTMLDivElement>(null);
    const handleRemove = (ev: React.MouseEvent<HTMLButtonElement>): void => {
        ev.stopPropagation();
        if (!props.editable) return;
        props.setItem((prev) => removeTag(prev, props.tag));
        console.log(target.current.parentElement);
        target.current.parentElement.focus();
    };

    let removeButton = null;
    if (props.editable) {
        removeButton = (
            <IconButton
                className={styles.tagRemoveButton}
                iconProps={{ iconName: 'Cancel' }}
                onClick={handleRemove}
            />
        );
    }

    const handleClick = React.useCallback(() => {
        const items = getItemsTaggedWith(indexManager, props.tag);
        showListOptionsCallout(target.current, {
            options: items.map((i) => ({
                key: i.Id,
                text: i.getFieldOr('caption', i.Title),
                data: i,
            })),
            allowNewVlaues: false,
            onSelect: (i) => {
                showModal(+i.key);
                hideListOptionsCallout();
            }
        })
    }, [indexManager, target, props.tag])
    
    return (
        <div className={styles.tag} role="button" onClick={handleClick} ref={target}>
            <span>{props.tag}</span>
            {removeButton}
        </div>
    );
};

export const TagsTemplate: React.FC<ITagsTemplateProps> = (props) => {
    const { indexManager } = React.useContext(GlobalContext);
    const addTagsButtonRef = React.useRef(null);

    const showTagsCallout = (): void => {
        function onSelect(option: IListOption): void {
            props.setItem((prev) => prev.addTag(option.key.toString()));
            hideListOptionsCallout();
        }

        const options = indexManager
            .getValues('tags', $eq('is service', 'false'))
            .map((s) => makeSimpleListOption(s))
            .filter((v) => v.key !== null);

        showListOptionsCallout(addTagsButtonRef.current, {
            options,
            allowNewVlaues: true,
            onSelect,
        });
    };

    const addTagElement = React.useMemo(() => {
        if (!props.editable) return null;
        return (
            <span ref={addTagsButtonRef}>
                <IconButton
                    onClick={showTagsCallout}
                    title="Add new tag"
                    className={styles.tagsFont}
                    iconProps={{ iconName: 'Add' }}
                />
            </span>
        );
    }, [props.editable]);

    return (
        <div className={`${styles.container} ${styles.tagsFont}`} tabIndex={1}>
            {props.tags.map((tag) => (
                <Tag
                    key={tag}
                    tag={tag}
                    editable={props.editable}
                    setItem={props.setItem}
                />
            ))}
            {addTagElement}
        </div>
    );
};
