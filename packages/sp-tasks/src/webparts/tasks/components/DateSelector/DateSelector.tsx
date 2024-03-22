import * as React from 'react';
import { DateTime } from 'luxon';
import { Calendar, DirectionalHint, IconButton, Text } from '@fluentui/react';
import styles from './DateSelector.module.scss';
import { hideCallout, showCallout } from 'sp-components';
import { MAIN_CALLOUT } from '../../utils/constants';
import { defaultCalendarStrings } from '../../utils/defaultCalendarStrings';

export interface IDateSelectorProps extends React.HTMLAttributes<HTMLDivElement> {
    date: Date;
    loading: boolean;
    setDate: (d: Date) => void;
}

const DateSelector: React.FC<IDateSelectorProps> = (props) => {
    const dateRef = React.useRef(null);
    const dateString = DateTime.fromJSDate(props.date).toLocaleString(DateTime.DATE_HUGE);
    const dt = React.useMemo(() => DateTime.fromJSDate(props.date), [props.date]).toISODate();
    const minDate = React.useMemo(() => DateTime.now().minus({ weeks: 1 }).toISODate(), []);
    const maxDate = React.useMemo(() => DateTime.now().plus({ weeks: 1 }).toISODate(), []);

    const changeDate = React.useCallback(
        (amount: number) =>
            props.setDate(DateTime.fromJSDate(props.date).plus({ days: amount }).toJSDate()),
        [props.date]
    );

    return (
        <div className={props.className}>
            <IconButton
                iconProps={{ iconName: 'ChevronLeft' }}
                onClick={changeDate.bind({}, -1)}
                disabled={props.loading || dt <= minDate}
            />
            <div
                ref={dateRef}
                className={styles.date}
                onClick={() =>
                    showCallout({
                        id: MAIN_CALLOUT,
                        calloutProps: {
                            target: dateRef,
                            directionalHint: DirectionalHint.bottomCenter,
                        },
                        content: (
                            <Calendar
                                strings={defaultCalendarStrings}
                                value={props.date}
                                onSelectDate={(date) => {
                                    props.setDate(date);
                                    hideCallout(MAIN_CALLOUT);
                                }}
                                isMonthPickerVisible={false}
                            />
                        ),
                    })
                }
                role="button"
            >
                <Text
                    style={{
                        minWidth: '250px',
                        display: 'inline-block',
                        textAlign: 'center',
                    }}
                    variant="large"
                >
                    {dateString}
                </Text>
            </div>
            <IconButton
                iconProps={{ iconName: 'ChevronRight' }}
                onClick={changeDate.bind({}, 1)}
                disabled={props.loading || dt >= maxDate}
            />
        </div>
    );
};

export default DateSelector;
