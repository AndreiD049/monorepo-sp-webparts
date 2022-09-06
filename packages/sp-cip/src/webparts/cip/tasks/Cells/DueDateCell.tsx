import { ActionButton, Calendar, Stack, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import {
    loadingStart,
    loadingStop,
} from '../../components/utils/LoadingAnimation';
import { calloutVisibility, taskUpdated } from '../../utils/dom-events';
import { TaskNode } from '../graph/TaskNode';
import { TaskNodeContext } from '../TaskNodeContext';
import styles from './Cells.module.scss';
import MainService from '../../services/main-service';
import { DAY } from '../../utils/constants';
import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';

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
    days: [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
    ],
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

const DueDateCellCallout = (props) => {
    const task: ITaskOverview = props.node.getTask();
    const taskService = MainService.getTaskService();
    const actionService = MainService.getActionService();
    const [selectedDate, setSelectedDate] = React.useState(
        new Date(task.DueDate)
    );

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
                onClick={async () => {
                    loadingStart();
                    calloutVisibility({
                        visible: false,
                    });
                    await taskService.updateTask(task.Id, {
                        DueDate: selectedDate.toISOString(),
                    });
                    const newTask = await taskService.getTask(task.Id);
                    await actionService.addAction(
                        task.Id,
                        'Due date',
                        `${task.DueDate}|${newTask.DueDate}`
                    );
                    taskUpdated(newTask);
                    loadingStop();
                }}
            >
                Save
            </ActionButton>
        </Stack>
    );
};

export const DueDateCell = ({ node }: { node: TaskNode }) => {
    const { isTaskFinished } = React.useContext(TaskNodeContext);
    const task = node.getTask();
    const textRef = React.useRef(null);

    const handleClick = React.useCallback(() => {
        calloutVisibility({
            target: textRef,
            visible: true,
            RenderComponent: DueDateCellCallout,
            componentProps: { node },
        });
    }, [node, textRef]);

    const dateClassName = React.useMemo(() => {
        const due = new Date(node.getTask().DueDate);
        const today = new Date();
        const diff =
            new Date(
                due.getFullYear(),
                due.getMonth(),
                due.getDate(),
                0,
                0,
                0
            ).getTime() -
            new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate(),
                0,
                0,
                0
            ).getTime();
        if (diff <= 0) {
            return styles.dueDateExpired;
        } else if (diff <= DAY * 2) {
            return styles.dueDateAboutToExpire;
        }
        return '';
    }, [node]);

    return (
        <button
            ref={textRef}
            onClick={handleClick}
            disabled={node.Display === 'disabled' || isTaskFinished}
            className={styles.button}
        >
            <Text variant="medium" className={dateClassName}>
                {new Date(task.DueDate).toLocaleDateString()}
            </Text>
        </button>
    );
};
