import { groupBy } from '@microsoft/sp-lodash-subset';
import { Dictionary } from 'lodash';
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
            return <CalendarItemCip wrapped={props.wrapped} />;
        case 'processflow':
            return <CalendarItemProcessFlow wrapped={props.wrapped} />;
        default:
            return <div>Unknwon item type. Check with Support.</div>;
    }
};

interface IRowProps {
    date: string;
    groups: Dictionary<IWrappedCalendarItem[]>;
}

const Row: React.FC<IRowProps> = (props) => {
    return (
        <>
            <Text block variant="mediumPlus" className={styles.groupText}>
                {props.date}
            </Text>
            {props.groups[props.date].map((item) => (
                <tr className={styles.row} key={`${item.type}${item.item.Id}`}><CalendarItem key={item.item.Id} wrapped={item} /></tr>
            ))}
        </>
    );
};

export const CalendarItems: React.FC<ICalendarItemsProps> = (props) => {
    const groups = React.useMemo(() => {
        return groupBy(props.items, (item) => item.date.toLocaleDateString());
    }, [props.items]);
    const groupKeys = React.useMemo(() => {
        const keys = Object.keys(groups);
        // sort dates ascending
        keys.sort((k1, k2) => {
            const d1 = new Date(k1);
            const d2 = new Date(k2);
            if (d1 < d2) return -1;
            return 1;
        });
        return keys;
    }, [groups]);

    return (
        <table className={styles.container}>
            {groupKeys.map((groupDate) => (
                <Row key={groupDate} date={groupDate} groups={groups} />
            ))}
        </table>
    );
};
