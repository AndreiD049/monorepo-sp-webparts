import { Icon, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { Item } from '../../item';
import { DescriptionEditor } from '../DescriptionEditor';
import styles from './ItemTemplate.module.scss';

export interface IItemTemplateProps
    extends React.HTMLAttributes<HTMLDivElement> {
    item: Item;
}

export const ItemTitleTemplate: React.FC<{ item: Item }> = (props) => {
    return (
        <Text block variant="large">
            {props.item.Title} - {props.item.Tags.join(", ")}
        </Text>
    );
};

const COLLAPSE_VISIBLE = 'collapse-visible';

export const ItemBodyTemplate: React.FC<{ item: Item }> = (props) => {
    const content = React.useRef<HTMLDivElement>(null);
    const [icon, setIcon] = React.useState('DoubleChevronUp');
    
    return (
        <div className={styles.itemBodyOuter}>
            <div
                role="button"
                className={styles.itemDescriptionButton}
                onClick={() => {
                    const element = content.current;
                    element.classList.toggle(COLLAPSE_VISIBLE);
                    if (element.classList.contains(COLLAPSE_VISIBLE)) {
                        element.style.maxHeight = element.scrollHeight + 'px';
                        setIcon('DoubleChevronDown');
                    } else {
                        element.style.maxHeight = '0px';
                        setIcon('DoubleChevronUp');
                    }
                }}
            >
                <Icon
                    iconName={icon}
                />
                Description
            </div>
            <div className={`${styles.itemBodyCollapsible} ${styles.itemBody}`} ref={content}>
                <DescriptionEditor
                    content={props.item.getFieldOr('text', '')}
                    editable={false}
                />
            </div>
        </div>
    );
};

export const ItemTemplate: React.FC<IItemTemplateProps> = (props) => {
    return (
        <div className={styles.container} style={props.style}>
            <ItemTitleTemplate item={props.item} />
            <ItemBodyTemplate item={props.item} />
        </div>
    );
};
