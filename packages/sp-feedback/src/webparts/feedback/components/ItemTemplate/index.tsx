import { Icon, IconButton, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { ITEM_EDITABLE } from '../../constants';
import { Item } from '../../item';
import { dispatchItemUpdated } from '../../services/events';
import { objectToTable } from '../../utils';
import { DescriptionEditor } from '../DescriptionEditor';
import styles from './ItemTemplate.module.scss';

export interface IItemTemplateProps
    extends React.HTMLAttributes<HTMLDivElement> {
    item: Item;
}

export const ItemHeaderTemplate: React.FC<{ item: Item }> = (props) => {
    return (
        <div className={styles.itemHeader}>
            <Text variant="large">{props.item.Title}</Text>
            <IconButton
                iconProps={{ iconName: 'Edit' }}
                onClick={() => {
                    dispatchItemUpdated(
                        props.item.Id,
                        props.item.getField(ITEM_EDITABLE)
                            ? props.item.unsetField(ITEM_EDITABLE)
                            : props.item.setField(ITEM_EDITABLE, true),
                        { temp: true }
                    );
                }}
            />
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
    const content = React.useRef<HTMLDivElement>(null);
    const [icon, setIcon] = React.useState('DoubleChevronUp');
    const [collapsed, setCollapsed] = React.useState(true);
    const editable = React.useMemo(
        () => props.item.getField<boolean>(ITEM_EDITABLE),
        [props.item]
    );

    React.useEffect(() => {
        function updateDom() {
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
                    /FB:\/|text|caption/
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
                    content={props.item.getFieldOr('text', '')}
                    editable={editable}
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
