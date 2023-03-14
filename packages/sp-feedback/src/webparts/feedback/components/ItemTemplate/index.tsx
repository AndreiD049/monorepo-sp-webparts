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

export const ItemHeaderTemplate: React.FC<{ item: Item }> = (props) => {
    const { indexManager } = React.useContext(GlobalContext);
    const handleEdit = () => {
        toggleItemEditable(props.item.Id, indexManager)
    };

    return (
        <div className={styles.itemHeader}>
            <div>
                <Text variant="large">{props.item.Title}</Text>
            </div>
            <div>
                <IconButton
                    iconProps={{ iconName: 'Edit' }}
                    onClick={handleEdit}
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

export const ItemBodyTemplate: React.FC<{ item: Item }> = (props) => {
    const { indexManager } = React.useContext(GlobalContext);
    const content = React.useRef<HTMLDivElement>(null);
    const [icon, setIcon] = React.useState('DoubleChevronUp');
    const [collapsed, setCollapsed] = React.useState(true);
    const editable = React.useMemo(() => isItemEditable(props.item.Id, indexManager), [props.item, indexManager]);

    React.useEffect(() => {
        function updateDom() {
            if (!content.current) return;
            if (content.current && !collapsed) {
                content.current.style.maxHeight =
                    content.current.firstElementChild.scrollHeight + 'px';
                setIcon('DoubleChevronDown');
            } else {
                content.current.style.maxHeight = '0';
                setIcon('DoubleChevronUp');
            }
        }
        updateDom();
        const observer = new MutationObserver(updateDom);
        observer.observe(content.current.firstElementChild, {
            childList: true,
            subtree: true,
        });
        () => observer.disconnect();
    }, [collapsed, editable]);

    return (
        <div className={styles.itemBodyOuter}>
            <ItemProperties
                properties={objectToTable(
                    props.item.Fields,
                    /text|caption/
                )}
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
                className={`${styles.itemBodyCollapsible} ${styles.itemBody}`}
                ref={content}
            >
                <DescriptionEditor
                    key={`${editable}`}
                    content={props.item.getFieldOr('text', '')}
                    editable={editable}
                    onBlur={(text) => {
                        console.log(text);
                        dispatchItemUpdated(props.item.Id, props.item.setField('text', text))
                    }}
                />
            </div>
        </div>
    );
};

export const ItemTemplate: React.FC<IItemTemplateProps> = (props) => {
    return (
        <div className={styles.container} style={props.style}>
            <ItemHeaderTemplate item={props.item} />
            <ItemBodyTemplate item={props.item} />
        </div>
    );
};
