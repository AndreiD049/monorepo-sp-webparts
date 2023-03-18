import { Icon, IconButton, Text, TextField } from 'office-ui-fabric-react';
import * as React from 'react';
import { Item } from '../../item';
import { dispatchItemUpdated } from '../../services/events';
import { objectToTable } from '../../utils';
import { DescriptionEditor } from '../DescriptionEditor';
import { GlobalContext } from '../Feedback';
import { isItemEditable, toggleItemEditable } from './editable-item';
import { ItemProperties, ItemPropertiesEditable } from './ItemProperties';
import styles from './ItemTemplate.module.scss';

export interface IItemTemplateProps
    extends React.HTMLAttributes<HTMLDivElement> {
    item: Item;
}

export const ItemHeaderTemplate: React.FC<{
    item: Item;
    editable: boolean;
    setItem: React.Dispatch<React.SetStateAction<Item>>;
    onSave: () => void;
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
        <div className={styles.itemHeader}>
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
}> = (props) => {
    const content = React.useRef<HTMLDivElement>(null);
    const [icon, setIcon] = React.useState('DoubleChevronUp');
    const [collapsed, setCollapsed] = React.useState(true);

    React.useEffect(() => {
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
            {properties}
            <div
                role="button"
                className={styles.itemDescriptionButton}
                onClick={() => {
                    setCollapsed((prev) => !prev);
                }}
            >
                <Icon iconName={icon} />
                Description
            </div>
            <div
                className={`${styles.itemBodyCollapsible} ${styles.itemBody} scroll-bar`}
                ref={content}
            >
                <DescriptionEditor
                    key={`${props.editable}`}
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
    return function(ev: KeyboardEvent) {
        if (ev.key === 's' && ev.ctrlKey === true) {
            ev.preventDefault();
            saveFunc();
        }
    }
}

export const ItemTemplate: React.FC<IItemTemplateProps> = (props) => {
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
        dispatchItemUpdated(newItem.Id, newItem.Fields);
        toggleItemEditable(newItem.Id, indexManager);
    }, [item, indexManager]);

    // Save on ctrl-s
    React.useEffect(() => {
        if (editable) {
            const handler = saveHandler(() => handleSave())
            document.addEventListener('keydown', handler);

            return () => document.removeEventListener('keydown', handler);
        }
    }, [editable, handleSave]);

    return (
        <div className={styles.container} style={props.style}>
            <ItemHeaderTemplate
                item={item}
                setItem={setItem}
                editable={editable}
                onSave={handleSave}
            />
            <ItemBodyTemplate
                item={item}
                editable={editable}
                setItem={setItem}
            />
        </div>
    );
};
