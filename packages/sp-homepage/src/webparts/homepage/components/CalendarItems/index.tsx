import { groupBy } from '@microsoft/sp-lodash-subset';
import { Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { ICalendarCipItem, ICalendarProcessFlowItem, IWrappedCalendarItem } from '../../sections/CalendarSection/ICalendarItem';
import { CalendarItemCip } from './CalendarItemCip';
import { CalendarItemProcessFlow } from './CalendarItemProcessFlow';
import styles from './CalendarItems.module.scss';

export interface ICalendarItemsProps {
    items: IWrappedCalendarItem[];
}

const CalendarItem: React.FC<{ wrapped: IWrappedCalendarItem }> = (props) => {
    switch (props.wrapped.type) {
        case 'cip':
            return <CalendarItemCip item={props.wrapped.item as ICalendarCipItem} />
        case 'processflow':
            return <CalendarItemProcessFlow item={props.wrapped.item as ICalendarProcessFlowItem} />
        default:
            return <div>Unknwon item type. Check with Support.</div>
    }
} 

export const CalendarItems: React.FC<ICalendarItemsProps> = (props) => {
    const groupedItems = React.useMemo(() => {
        return groupBy(props.items, (item) => item.date);
    }, [props.items]);
    const groups = React.useMemo(() => Object.keys(groupedItems), [groupedItems]);

    return (
        <div className={styles.container}>
            {
                groups.map((groupDate) => (
                    <div key={groupDate} className={styles.dateGroup}>
                        <Text block variant='mediumPlus' className={styles.groupText}>{groupDate}</Text>
                        { groupedItems[groupDate].map((item) => (<CalendarItem key={item.item.Id} wrapped={item} />))}
                    </div>
                ))
            }
        </div>
    );
};
