import { ActionButton, Calendar, DirectionalHint, Stack, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { Callout, hideCallout, showCallout } from '../../Callout';
import styles from './DueDateCell.module.scss';

const CALLOUT_ID = 'sp-component-duedate-cell';

const defaultCalendarStrings = {
    months: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ],
    shortMonths: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
    ],
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    shortDays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    goToToday: 'Go to today',
    weekNumberFormatString: 'Week number {0}',
    prevMonthAriaLabel: 'Previous month',
    nextMonthAriaLabel: 'Next month',
    prevYearAriaLabel: 'Previous year',
    nextYearAriaLabel: 'Next year',
    prevYearRangeAriaLabel: 'Previous year range',
    nextYearRangeAriaLabel: 'Next year range',
    closeButtonAriaLabel: 'Close',
    selectedDateFormatString: 'Selected date {0}',
    todayDateFormatString: "Today's date {0}",
    monthPickerHeaderAriaLabel: '{0}, change year',
    yearPickerHeaderAriaLabel: '{0}, change month',
    dayMarkedAriaLabel: 'marked',
};

export interface IDueDateCellCalloutProps {
    date: Date;
    onDateChange: (date: Date) => void;
}

const DueDateCellCallout: React.FC<IDueDateCellCalloutProps> = (props) => {
    const [selectedDate, setSelectedDate] = React.useState(new Date(props.date));

    return (
        <Stack horizontalAlign="center">
            <Calendar
                showGoToToday
                onSelectDate={(dt) => setSelectedDate(dt)}
                value={selectedDate}
                strings={defaultCalendarStrings}
            />
            <ActionButton
                iconProps={{ iconName: 'Save' }}
                onClick={() => props.onDateChange(selectedDate)}
            >
                Save
            </ActionButton>
        </Stack>
    );
};

export interface IDueDateCellProps extends React.HTMLAttributes<HTMLElement> {
    dueDate: Date;
    disabled?: boolean;
    calloutId?: string;

    onDateChange?: (date: Date) => void;
}

const DAY = 1000 * 60 * 60 * 24;

export const DueDateCell: React.FC<IDueDateCellProps> = (props) => {
    const calloutId = props.calloutId || CALLOUT_ID;
    const textRef = React.useRef(null);

    const handleClick = React.useCallback(() => {
        showCallout({
            id: calloutId,
            calloutProps: {
                target: textRef,
                directionalHint: DirectionalHint.bottomCenter,
            },
            content: (
                <DueDateCellCallout
                    date={props.dueDate}
                    onDateChange={(date: Date) => {
                        props.onDateChange && props.onDateChange(date);
                        hideCallout(calloutId);
                    }}
                />
            ),
        });
    }, [calloutId, props.onDateChange]);

    const dateClassName = React.useMemo(() => {
        const due = props.dueDate;
        const today = new Date();
        const diff =
            new Date(due.getFullYear(), due.getMonth(), due.getDate(), 0, 0, 0).getTime() -
            new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0).getTime();
        if (diff <= 0) {
            return styles.dueDateExpired;
        } else if (diff <= DAY * 2) {
            return styles.dueDateAboutToExpire;
        }
        return '';
    }, [props.dueDate]);

    return (
        <>
            <button
                onClick={handleClick}
                ref={textRef}
                disabled={props.disabled}
                className={styles.button}
                style={props.style}
            >
                <Text variant="medium" className={dateClassName}>
                    {new Date(props.dueDate).toLocaleDateString()}
                </Text>
            </button>
            {props.calloutId ? null : <Callout id={calloutId} />}
        </>
    );
};
