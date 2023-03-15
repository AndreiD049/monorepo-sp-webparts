import { Icon, IconButton, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { Item } from '../../item';
import { dispatchItemUpdated } from '../../services/events';
import { objectToTable } from '../../utils';
import { DescriptionEditor } from '../DescriptionEditor';
import { GlobalContext } from '../Feedback';
import { isItemEditable, toggleItemEditable } from './editable-item';
import styles from './ItemTemplate.module.scss';

export interface IItemTemplateProps
    extends React.HTMLAttributes<HTMLDivElement> {
    item: Item;
}

export const ItemHeaderTemplate: React.FC<{ item: Item, editable: boolean }> = (props) => {
    const { indexManager } = React.useContext(GlobalContext);
    const handleEdit = (): void => {
        toggleItemEditable(props.item.Id, indexManager);
    };
    
    const handleSave = async (): Promise<void> => {
        const item = await props.item.replaceImagesIn('text');
        dispatchItemUpdated(item.Id, item.Fields);
        toggleItemEditable(item.Id, indexManager);
    }

    return (
        <div className={styles.itemHeader}>
            <div>
                <Text variant="large">{props.item.Title}</Text>
            </div>
            <div>
                <IconButton
                    iconProps={{ iconName: props.editable ? 'Save' : 'Edit' }}
                    onClick={props.editable ? handleSave : handleEdit}
                    className={styles.titleButton}
                />
            </div>
        </div>
    );
};

export const ItemProperties: React.FC<{
    properties: [string, string | number][];
}> = (props) => {
    return (
        <div style={{ marginBottom: '.5em' }}>
            <table className={styles.propTable}>
                <tbody>
                    {props.properties.map(([key, value]) => (
                        <tr key={key}>
                            <td>{key}</td>
                            <td>{value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export const ItemBodyTemplate: React.FC<{ item: Item, editable: boolean, setItem: React.Dispatch<React.SetStateAction<Item>> }> = (props) => {
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
        const item = props.item.setField('text', text);
        props.setItem(item);
    }

    return (
        <div className={styles.itemBodyOuter}>
            <ItemProperties
                properties={objectToTable(props.item.Fields, /text|caption/)}
            />
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

    return (
        <div className={styles.container} style={props.style}>
            <ItemHeaderTemplate item={item} editable={editable} />
            <ItemBodyTemplate item={item} editable={editable} setItem={setItem} />
        </div>
    );
};
