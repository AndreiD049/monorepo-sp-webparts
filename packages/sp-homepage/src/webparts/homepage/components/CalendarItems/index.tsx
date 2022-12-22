import { groupBy } from '@microsoft/sp-lodash-subset';
import { Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { IWrappedCalendarItem } from '../../sections/CalendarSection/ICalendarItem';
import { CalendarItemCip } from './CalendarItemCip';
import { CalendarItemProcessFlow } from './CalendarItemProcessFlow';
import styles from './CalendarItems.module.scss';

export interface ICalendarItemsProps {
    items: IWrappedCalendarItem[];
}

const CalendarItem: React.FC<{ wrapped: IWrappedCalendarItem }> = (props) => {
    switch (props.wrapped.type) {
        case 'cip':
            return <CalendarItemCip wrapped={props.wrapped} />
        case 'processflow':
            return <CalendarItemProcessFlow wrapped={props.wrapped} />
        default:
            return <div>Unknwon item type. Check with Support.</div>
    }
} 

export const CalendarItems: React.FC<ICalendarItemsProps> = (props) => {
    const groupedItems = React.useMemo(() => {
        return groupBy(props.items, (item) => item.date.toLocaleDateString());
    }, [props.items]);
    const groups = React.useMemo(() => Object.keys(groupedItems), [groupedItems]);

    return (
        <table className={styles.container}>
            {
                groups.map((groupDate) => (
                    <>
                        <Text block variant='mediumPlus' className={styles.groupText}>{groupDate}</Text>
                        { groupedItems[groupDate].map((item) => (<CalendarItem key={item.item.Id} wrapped={item} />))}
                    </>
                ))
            }
        </table>
    );
};
