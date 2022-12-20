/* eslint-disable @typescript-eslint/no-explicit-any */
import { Calendar, DateRangeType } from 'office-ui-fabric-react';
import * as React from 'react';
import { ISectionProps } from '../../components/Section';
import { defaultCalendarStrings } from './defaultCalendarStrings';
import styles from './CalendarSection.module.scss';
import SourceService from '../../services/SourceService';
import { getExpandString, getSelectString, getSourceDate } from './service-helper';
import { CalendarItemTypes, CalendarTypes, IWrappedCalendarItem } from './ICalendarItem';
import { CalendarItems } from '../../components/CalendarItems';
import { DateTime } from 'luxon';
import { filter } from 'lodash';

export interface ICalendarSectionProps extends ISectionProps {
    // Props go here
}

export const CalendarSection: React.FC<ICalendarSectionProps> = (props) => {
    const [selectedDate, setSelectedDate] = React.useState(new Date());
    const [items, setItems] = React.useState<IWrappedCalendarItem[]>([]);
    const services = React.useMemo(() => {
        return props.section.sources.map((source) => new SourceService(source, getSelectString(source), getExpandString(source)))
    }, [props.section.sources]);

    React.useEffect(() => {
        async function run(): Promise<void> {
            if (services.length > 0) {
                for (const service of services) {
                    const items = await service.getSourceData() as CalendarItemTypes[];
                    setItems((prev) => [...prev, ...items.map((item) => {
                        return {
                            type: service.source.type as CalendarTypes,
                            date: getSourceDate(service.source, item),
                            item,
                        }
                    })]);
                }
            }
        }
        run().catch((err) => console.error(err));
    }, [services]);

    const filteredItems = React.useMemo(() => {
        const dt = DateTime.fromJSDate(selectedDate);
        const startDate = dt.toUnixInteger();
        const endDate = dt.plus({ days: 7 }).toUnixInteger();
        return items.filter((item) => {
            const date = DateTime.fromJSDate(new Date(item.date)).toUnixInteger();
            return date >= startDate && date <= endDate;
        })
    }, [selectedDate, items]);

    return (
        <div className={styles.container}>
            <div className={styles.calendarContainer}>
                <Calendar strings={defaultCalendarStrings} value={selectedDate} onSelectDate={(date) => setSelectedDate(date)} />
            </div>
            <div>
                <CalendarItems items={filteredItems} />
            </div>
        </div>
    );
};
