import { ActionButton, Calendar, DirectionalHint, Stack, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { Callout, hideCallout, showCallout } from '../../Callout';
import styles from './DueDateCell.module.scss';
var CALLOUT_ID = 'sp-component-duedate-cell';
var defaultCalendarStrings = {
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
var DueDateCellCallout = function (props) {
    var _a = React.useState(new Date(props.date)), selectedDate = _a[0], setSelectedDate = _a[1];
    return (React.createElement(Stack, { horizontalAlign: "center" },
        React.createElement(Calendar, { showGoToToday: true, onSelectDate: function (dt) { return setSelectedDate(dt); }, value: selectedDate, strings: defaultCalendarStrings }),
        React.createElement(ActionButton, { iconProps: { iconName: 'Save' }, onClick: function () { return props.onDateChange(selectedDate); } }, "Save")));
};
var DAY = 1000 * 60 * 60 * 24;
export var DueDateCell = function (props) {
    var calloutId = props.calloutId || CALLOUT_ID;
    var textRef = React.useRef(null);
    var handleClick = React.useCallback(function () {
        showCallout({
            id: calloutId,
            calloutProps: {
                target: textRef,
                directionalHint: DirectionalHint.bottomCenter,
            },
            content: (React.createElement(DueDateCellCallout, { date: props.dueDate, onDateChange: function (date) {
                    props.onDateChange && props.onDateChange(date);
                    hideCallout(calloutId);
                } })),
        });
    }, []);
    var dateClassName = React.useMemo(function () {
        var due = props.dueDate;
        var today = new Date();
        var diff = new Date(due.getFullYear(), due.getMonth(), due.getDate(), 0, 0, 0).getTime() -
            new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0).getTime();
        if (diff <= 0) {
            return styles.dueDateExpired;
        }
        else if (diff <= DAY * 2) {
            return styles.dueDateAboutToExpire;
        }
        return '';
    }, [props.dueDate]);
    return (React.createElement(React.Fragment, null,
        React.createElement("button", { onClick: handleClick, ref: textRef, disabled: props.disabled, className: styles.button },
            React.createElement(Text, { variant: "medium", className: dateClassName }, new Date(props.dueDate).toLocaleDateString())),
        props.calloutId ? null : React.createElement(Callout, { id: calloutId })));
};
//# sourceMappingURL=index.js.map