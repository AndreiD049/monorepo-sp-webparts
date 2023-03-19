import { IconButton } from 'office-ui-fabric-react';
import * as React from 'react';
import { Item } from '../../../item';
import { GlobalContext } from '../../Feedback';
import {
    hideListOptionsCallout,
    IListOption,
    makeSimpleListOption,
    showListOptionsCallout,
} from '../../OptionList';
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
}

const Tag: React.FC<{
    tag: string;
    editable: boolean;
    setItem?: ITagsTemplateProps['setItem'];
}> = (props) => {

    const handleRemove = (): void => {
        if (!props.editable) return;
        props.setItem((prev) => removeTag(prev, props.tag));
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

    return (
        <div className={styles.tag}>
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
            .getValues('tags')
            .map((s) => makeSimpleListOption(s));

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
        <div className={`${styles.container} ${styles.tagsFont}`}>
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
