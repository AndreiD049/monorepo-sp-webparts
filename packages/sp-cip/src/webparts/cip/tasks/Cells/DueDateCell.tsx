import { ActionButton, Calendar, Stack, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { useActions } from '../../comments/useActions';
import { loadingStart, loadingStop } from '../../components/Utils/LoadingAnimation';
import { calloutVisibility, taskUpdated } from '../../utils/dom-events';
import { TaskNode } from '../graph/TaskNode';
import { ITaskOverview } from '../ITaskOverview';
import { TaskNodeContext } from '../TaskNodeContext';
import { useTasks } from '../useTasks';
import styles from './Cells.module.scss';

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
    const { updateTask, getTask } = useTasks();
    const { addAction } = useActions();
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
                    await updateTask(task.Id, {
                        DueDate: selectedDate.toISOString(),
                    });
                    const newTask = await getTask(task.Id);
                    await addAction(task.Id, 'Due date', `${task.DueDate}|${newTask.DueDate}`);
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

    return (
        <button
            ref={textRef}
            onClick={handleClick}
            disabled={node.Display === 'disabled' || isTaskFinished}
            className={styles.button}
        >
            <Text variant="medium">
                {new Date(task.DueDate).toLocaleDateString()}
            </Text>
        </button>
    );
};
