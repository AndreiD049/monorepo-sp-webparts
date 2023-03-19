import { Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import {
    getGroupedItems,
    getGroupKeys,
} from '../../../../features/grouped-items';
import { ITEM_TYPES } from '../../constants';
import FeedbackWebPart from '../../FeedbackWebPart';
import { Item } from '../../item';
import { dispatchItemUpdated } from '../../services/events';
import { IItemTemplateProps, ItemTemplate } from '../ItemTemplate';
import styles from './BoardView.module.scss';

export interface IBoardViewProps {
    items: Item[];
    groupField: string;
}

interface IBoardColumnProps {
    label: string;
    groupField: string;
    items: Item[];
    movedItems: (string | number)[];
    setMovedItems: React.Dispatch<React.SetStateAction<(string | number)[]>>;
}

const DraggableItem: React.FC<IItemTemplateProps & { isMoved: boolean }> = (
    props
) => {
    const [{ isDragging }, drag] = useDrag(
        {
            type: ITEM_TYPES.Item,
            item: { id: props.item.Id },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        },
        [props.item]
    );

    return (
        <div
            style={{
                visibility: isDragging || props.isMoved ? 'hidden' : 'visible',
                backgroundColor: 'transparent',
            }}
        >
            <ItemTemplate {...props} source={drag} />
        </div>
    );
};

const BoardColumn: React.FC<IBoardColumnProps> = (props) => {
    const [{ isOver, canDrop }, drop] = useDrop({
        accept: [ITEM_TYPES.Item],
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
        drop: (item: { id: number | string }) => {
            props.setMovedItems((prev) => [...prev, item.id]);
            dispatchItemUpdated(item.id, { [props.groupField]: props.label }, null, () => {
                props.setMovedItems((prev) => prev.filter((i) => i !== item.id));
            });
        },
        canDrop: (item) => props.items.find((i) => i.Id === item.id) === undefined
    });

    const dndStyles: React.CSSProperties = React.useMemo(() => {
        const result: React.CSSProperties = {};
        if (canDrop && isOver) {
            result.backgroundColor = FeedbackWebPart.theme.palette.themeLighter;
        }
        return result;
    }, [isOver, canDrop]);

    return (
        <div className={`${styles.column} scroll-bar`} style={dndStyles} ref={drop}>
            <Text className={styles.columnLabel} variant="large" block>
                {props.label}
            </Text>
            <div className={styles.columnBody}>
                {props.items.map((item) => (
                    <DraggableItem
                        key={item.Id}
                        item={item}
                        isMoved={props.movedItems.indexOf(item.Id) !== -1}
                    />
                ))}
            </div>
        </div>
    );
};

export const BoardView: React.FC<IBoardViewProps> = (props) => {
    const [movedItems, setMovedItems] = React.useState<(string | number)[]>([]);
    if (!props.groupField) {
        return (
            <div className={styles.container}>
                Board view requires a Group field to be selected.
            </div>
        );
    }

    const groupedItems = React.useMemo(
        () => getGroupedItems(props.items, props.groupField),
        [props.items]
    );
    const groupKeys = React.useMemo(
        () => getGroupKeys(groupedItems).sort(),
        [groupedItems]
    );

    return (
        <div className={`${styles.container} scroll-bar`}>
            {groupKeys.map((key) => (
                <BoardColumn
                    key={key}
                    label={key}
                    groupField={props.groupField}
                    movedItems={movedItems}
                    setMovedItems={setMovedItems}
                    items={groupedItems[key]}
                />
            ))}
        </div>
    );
};
