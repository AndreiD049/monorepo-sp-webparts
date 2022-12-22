/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import SourceService from '../../services/SourceService';
import { Calendar, Separator, Text } from 'office-ui-fabric-react';
import { CalendarChoiceGroup, ChoiceDisplayType } from '../../components/CalendarChoiceGroup';
import { CalendarItemTypes, CalendarTypes, IWrappedCalendarItem } from './ICalendarItem';
import { CalendarItems } from '../../components/CalendarItems';
import { DateTime } from 'luxon';
import { ISectionProps } from '../../components/Section';
import { defaultCalendarStrings } from './defaultCalendarStrings';
import { getExpandString, getSelectString, getSourceDate } from './service-helper';
import styles from './CalendarSection.module.scss';
import { NoData } from '../../components/NoData';
import { listenSectionEvent } from '../../components/Section/section-events';
import { LoadingSpinner, showSpinner, hideSpinner } from 'sp-components';
import { CALENDAR_SPINNER_ID } from '../../constants';

export interface ICalendarSectionProps extends ISectionProps {
    // Props go here
}

export const CalendarSection: React.FC<ICalendarSectionProps> = (props) => {
    const [selectedDate, setSelectedDate] = React.useState(new Date());
    const [choice, setChoice] = React.useState<ChoiceDisplayType>('week');
    const [items, setItems] = React.useState<IWrappedCalendarItem[]>([]);
    const [reload, setReload] = React.useState(false);
    const services = React.useMemo(() => {
        return props.section.sources.map(
            (source) => new SourceService(source, getSelectString(source), getExpandString(source))
        );
    }, [props.section.sources]);
    const startDate = React.useMemo(() => {
        if (choice === 'month') return DateTime.fromJSDate(selectedDate).startOf('month');
        return DateTime.fromJSDate(selectedDate).startOf('day');
    }, [selectedDate, choice]);
    const endDate = React.useMemo(() => {
        if (choice === 'month') return DateTime.fromJSDate(selectedDate).endOf('month');
        return DateTime.fromJSDate(selectedDate).plus({ day: 7 });
    }, [selectedDate, choice]);

    React.useEffect(() => {
        async function run(): Promise<void> {
            try {
                if (services.length > 0) {
                    showSpinner(CALENDAR_SPINNER_ID);
                    let result: IWrappedCalendarItem[] = [];
                    for (const service of services) {
                        const items = (await service.getSourceData()) as CalendarItemTypes[];
                        result = [
                            ...result,
                            ...items.map((item) => {
                                return {
                                    type: service.source.type as CalendarTypes,
                                    pageUrl: service.source.pageUrl,
                                    date: getSourceDate(service.source, item),
                                    item,
                                };
                            }),
                        ];
                    }
                    setItems(result);
                }
            } finally {
                hideSpinner(CALENDAR_SPINNER_ID);
            }
        }
        run().catch((err) => console.error(err));
    }, [services, reload]);

    const filteredItems = React.useMemo(() => {
        const startMillis = startDate.toUnixInteger();
        const endMillis = endDate.toUnixInteger();
        return items.filter((item) => {
            const date = DateTime.fromJSDate(new Date(item.date)).toUnixInteger();
            return date >= startMillis && date <= endMillis;
        });
    }, [selectedDate, items, startDate, endDate]);


    React.useEffect(() => {
        const listenHandlerRemove = listenSectionEvent(props.section.name, 'REFRESH', async () => {
            showSpinner(CALENDAR_SPINNER_ID);
            for (const service of services) {
                await service.clearCache();
            }
            // Reload data
            setReload((prev) => !prev);
        });
        return () => {
            listenHandlerRemove();
        };
    }, [props.section]);

    const calendarWeekly = React.useMemo(() => {
        if (choice !== 'week') return null;
        return (
            <Calendar
                strings={defaultCalendarStrings}
                value={selectedDate}
                onSelectDate={(date) => setSelectedDate(date)}
                isMonthPickerVisible={false}
                isDayPickerVisible={true}
            />
        );
    }, [choice, selectedDate]);

    const calendarMonthly = React.useMemo(() => {
        if (choice !== 'month') return null;
        return (
            <Calendar
                className={styles.monthCalendar}
                strings={{ ...defaultCalendarStrings }}
                value={selectedDate}
                onSelectDate={(date) =>
                    setSelectedDate(DateTime.fromJSDate(date).startOf('month').toJSDate())
                }
                isMonthPickerVisible={true}
                isDayPickerVisible={false}
                showGoToToday={false}
            />
        );
    }, [choice, selectedDate]);

    return (
        <div className={styles.container}>
            <LoadingSpinner id={CALENDAR_SPINNER_ID} />
            <Text block variant="mediumPlus" className={styles.header}>
                {choice === 'week'
                    ? `${startDate.toFormat('EEE, d MMM')} - ${endDate.toFormat('EEE, d MMM')}`
                    : DateTime.fromJSDate(selectedDate).toFormat('MMMM yyyy')}
            </Text>
            <div className={styles.calendarContainer}>
                <CalendarChoiceGroup
                    selectedChoice={choice}
                    onChoiceChange={(choice) => setChoice(choice)}
                />
                {calendarWeekly}
                {calendarMonthly}
            </div>
            <Separator />
            <div>
                {filteredItems.length > 0 ? <CalendarItems items={filteredItems} /> : <NoData />}
            </div>
        </div>
    );
};
