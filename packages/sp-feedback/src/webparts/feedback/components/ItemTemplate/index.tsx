import { Icon, IconButton, Text, TextField } from 'office-ui-fabric-react';
import * as React from 'react';
import { Item } from '../../item';
import { dispatchItemUpdated } from '../../services/events';
import { objectToTable } from '../../utils';
import { DescriptionEditor } from '../DescriptionEditor';
import { GlobalContext } from '../Feedback';
import { isItemEditable, toggleItemEditable } from './editable-item';
import { ItemProperties, ItemPropertiesEditable } from './ItemProperties';
import { TagsTemplate } from './TagsTemplate';
import { ConnectDragSource } from 'react-dnd';
import styles from './ItemTemplate.module.scss';

export interface IItemTemplateProps
    extends React.HTMLAttributes<HTMLDivElement> {
    item: Item;
    source?: ConnectDragSource;
    collapsible?: boolean;
}

export const ItemHeaderTemplate: React.FC<{
    item: Item;
    editable: boolean;
    setItem: React.Dispatch<React.SetStateAction<Item>>;
    onSave: () => void;
    source?: ConnectDragSource;
}> = (props) => {
    const { indexManager } = React.useContext(GlobalContext);
    const handleEdit = (): void => {
        toggleItemEditable(props.item.Id, indexManager);
    };

    const title = React.useMemo(() => {
        if (props.editable) {
            return (
                <TextField
                    value={props.item.getFieldOr('caption', props.item.Title)}
                    onChange={(_ev, value) =>
                        props.setItem((prev) => prev.setField('caption', value))
                    }
                    width="100%"
                />
            );
        }
        return (
            <Text variant="large">
                {props.item.getFieldOr('caption', props.item.Title)}
            </Text>
        );
    }, [props.editable, props.item]);

    return (
        <div className={styles.itemHeader} ref={props.source}>
            <div style={{ flexGrow: props.editable ? 1 : 0 }}>{title}</div>
            <div>
                <IconButton
                    iconProps={{ iconName: props.editable ? 'Save' : 'Edit' }}
                    onClick={props.editable ? props.onSave : handleEdit}
                    className={styles.titleButton}
                />
            </div>
        </div>
    );
};

export const ItemBodyTemplate: React.FC<{
    item: Item;
    editable: boolean;
    setItem: React.Dispatch<React.SetStateAction<Item>>;
    collapsible?: boolean;
}> = ({ collapsible = true, ...props }) => {
    const content = React.useRef<HTMLDivElement>(null);
    const [icon, setIcon] = React.useState('DoubleChevronUp');
    const [collapsed, setCollapsed] = React.useState(collapsible);

    React.useEffect(() => {
        if (!collapsible) return;
        if (!content.current) return;
        if (!collapsed) {
            content.current.style.maxHeight = '400px';
            setIcon('DoubleChevronDown');
        } else {
            content.current.style.maxHeight = '0';
            setIcon('DoubleChevronUp');
        }
    }, [collapsed, props.editable]);

    const handleChange = (text: string): void => {
        props.setItem((prev) => prev.setField('text', text));
    };

    const properties = React.useMemo(() => {
        const properties = objectToTable(props.item.Fields, /text|caption/);
        if (props.editable) {
            return (
                <ItemPropertiesEditable
                    properties={properties}
                    item={props.item}
                    setItem={props.setItem}
                />
            );
        }
        return (
            <ItemProperties
                properties={objectToTable(props.item.Fields, /text|caption/)}
            />
        );
    }, [props.editable, props.item]);

    return (
        <div className={styles.itemBodyOuter}>
            <TagsTemplate
                tags={props.item.getFieldOr('tags', [])}
                editable={props.editable}
                setItem={props.setItem}
            />
            {properties}
            <div
                role="button"
                className={styles.itemDescriptionButton}
                onClick={() => {
                    if (!collapsible) return;
                    setCollapsed((prev) => !prev);
                }}
            >
                {collapsible && <Icon iconName={icon} />}
                Description
            </div>
            <div
                className={`${styles.itemBodyCollapsible} ${styles.itemBody} scroll-bar`}
                ref={content}
            >
                <DescriptionEditor
                    key={`${props.editable}-${props.item?.Modified}`}
                    content={props.item.getFieldOr('text', '')}
                    editable={props.editable}
                    onUpdate={handleChange}
                />
            </div>
        </div>
    );
};

// Save handler
function saveHandler(saveFunc: () => void): ((ev: KeyboardEvent) => void) {
    return function (ev: KeyboardEvent) {
        if (ev.key === 's' && ev.ctrlKey === true) {
            ev.preventDefault();
            saveFunc();
        }
    };
}

export const ItemTemplate: React.FC<IItemTemplateProps> = ({
    collapsible = true,
    ...props
}) => {
    const rootEventListener = React.useRef<HTMLDivElement>(null);
    const { indexManager } = React.useContext(GlobalContext);
    const [item, setItem] = React.useState(props.item);
    const editable = React.useMemo(
        () => isItemEditable(props.item.Id, indexManager),
        [props.item, indexManager]
    );

    React.useEffect(() => {
        setItem(props.item);
    }, [props.item]);

    const handleSave = React.useCallback(async () => {
        const newItem = await item.replaceImagesIn('text');
        dispatchItemUpdated(newItem.Id, {
            ...newItem.Fields,
            tags: newItem.Tags,
        });
        toggleItemEditable(newItem.Id, indexManager);
    }, [item, indexManager]);

    // Save on ctrl-s
    React.useEffect(() => {
        if (editable && rootEventListener.current) {
            const handler = saveHandler(() => handleSave());
            rootEventListener.current.addEventListener('keydown', handler);

            return () => rootEventListener.current.removeEventListener('keydown', handler);
        }
    }, [editable, handleSave, rootEventListener]);

    return (
        <div className={styles.container} style={props.style} ref={rootEventListener} tabIndex={1}>
            <ItemHeaderTemplate
                item={item}
                setItem={setItem}
                editable={editable}
                onSave={handleSave}
                source={props.source}
            />
            <ItemBodyTemplate
                item={item}
                editable={editable}
                setItem={setItem}
                collapsible={collapsible}
            />
        </div>
    );
};
