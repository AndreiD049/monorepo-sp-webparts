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
import { NoData } from '../../components/NoData';
import { listenSectionEvent } from '../../components/Section/section-events';
import { LoadingSpinner, showSpinner, hideSpinner } from 'sp-components';
import { CALENDAR_SPINNER_ID } from '../../constants';
import { CalendarContext, ICalendarContext } from '../../context/CalendarContext/CalendarContext';
import styles from './CalendarSection.module.scss';

interface IHeaderProps {
    calendarType: ChoiceDisplayType;
    startDate: DateTime;
    endDate: DateTime;
}

const Header: React.FC<IHeaderProps> = (props) => {
    const headerText = React.useMemo(() => {
        if (props.calendarType === 'week') {
            return `${props.startDate.toFormat('EEE, d MMM')} - ${props.endDate.toFormat('d MMM')}`;
        }
        return props.startDate.toFormat('MMMM yyyy');
    }, [props.calendarType, props.startDate]);

    return (
        <Text block variant="mediumPlus" className={styles.header}>
            {headerText}
        </Text>
    );
};

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

    const options = React.useMemo(() => {
        const optionsSet = new Set(props.section.options);
        console.log(optionsSet);
        const result: ICalendarContext = {
            showUser: false,
            showStatus: false,
        };
        if (optionsSet.has('showuser')) {
            result.showUser = true;
        }
        if (optionsSet.has('showstatus')) {
            result.showStatus = true;
        }
        return result;
    }, [props.section]);

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

    const calendar = React.useMemo(() => {
        return (
            <Calendar
                key={choice}
                strings={defaultCalendarStrings}
                value={selectedDate}
                onSelectDate={(date) => setSelectedDate(date)}
                isMonthPickerVisible={choice === 'month'}
                isDayPickerVisible={choice === 'week'}
                className={styles.monthCalendar}
                highlightSelectedMonth
            />
        );
    }, [choice, selectedDate]);

    return (
        <CalendarContext.Provider value={options}>
            <div className={styles.container}>
                <Header startDate={startDate} endDate={endDate} calendarType={choice} />

                <div className={styles.calendarContainer}>
                    <CalendarChoiceGroup
                        selectedChoice={choice}
                        onChoiceChange={(choice) => setChoice(choice)}
                    />
                    {calendar}
                </div>

                <Separator />

                {filteredItems.length > 0 ? <CalendarItems items={filteredItems} /> : <NoData />}
                <LoadingSpinner id={CALENDAR_SPINNER_ID} />
            </div>
        </CalendarContext.Provider>
    );
};
