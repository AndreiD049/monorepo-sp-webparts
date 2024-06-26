import { DateTime } from 'luxon';
import { IDropdownOption, MessageBarType } from '@fluentui/react';
import * as React from 'react';
import { FC } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { updateTaskLog } from '../../hooks/useTasks';
import { ITaskInfo } from '../../models/ITaskProperties';
import { MINUTE } from '../../utils/constants';
import GlobalContext from '../../utils/GlobalContext';
import { getTaskUniqueId, isTask } from '../../utils/utils';
import { TaskPersona } from './persona/TaskPersona';
import { SPnotify } from 'sp-react-notifications';
import styles from './Task.module.scss';
import { Task as InnerTask } from 'sp-components';
import TasksWebPart from '../../TasksWebPart';
import ITask from '@service/sp-tasks/dist/models/ITask';
import ITaskLog, { TaskStatus } from '@service/sp-tasks/dist/models/ITaskLog';

export interface ITaskProps {
    task: ITaskLog | ITask;
    index: number;
    date: Date;
}

const Task: FC<ITaskProps> = (props) => {
    const { TaskLogsService, canEditOthers, currentUser } = React.useContext(GlobalContext);
    const [expired, setExpired] = React.useState<boolean>(false);
    const [disabled, setDisabled] = React.useState(false);
    const [isHovering, setIsHovering] = React.useState<boolean>(false);

    const info: ITaskInfo = React.useMemo(() => {
        if (isTask(props.task)) {
            return {
                description: props.task.Description,
                title: props.task.Title,
                user: props.task.AssignedTo,
                date: DateTime.fromJSDate(props.date)
                    .plus({ days: props.task.DaysDuration })
                    .toLocaleString(DateTime.DATE_SHORT),
                time: DateTime.fromISO(props.task.Time).toLocaleString(DateTime.TIME_24_SIMPLE),
                status: 'Open',
                category: props.task.Category,
            };
        }
        return {
            description: props.task.Description || '',
            remark: props.task.Remark,
            title: props.task.Title,
            user: props.task.User,
            date: DateTime.fromISO(props.task.Time || props.task.Date).toLocaleString(
                DateTime.DATE_SHORT
            ),
            time: DateTime.fromISO(props.task.Time || props.task.Task?.Time).toLocaleString(
                DateTime.TIME_24_SIMPLE
            ),
            status: props.task.Status,
            category: props.task.Task.Category,
        };
    }, [props.task]);

    const time = React.useMemo(() => {
        const dt = isTask(props.task)
            ? DateTime.fromJSDate(props.date)
            : DateTime.fromISO(props.task.Time);
        return DateTime.fromISO(info.time).set({
            day: dt.day,
            month: dt.month,
            year: dt.year,
        });
    }, [props.task, props.date, info]);

    React.useEffect(() => {
        function checkExpired() {
            if (info.status !== 'Open') {
                return setExpired(false);
            }
            if (time <= DateTime.now()) {
                setExpired(true);
            } else {
                setExpired(false);
            }
        }
        checkExpired();
        const timer = setInterval(checkExpired, MINUTE);
        return () => clearInterval(timer);
    }, [info, props.task, time]);

    /**
     * Check tasks from previous days, if
     * Number of hours since deadline is more than 15 hours, make it disabled
     */
    React.useEffect(() => {
        const dt = DateTime.fromJSDate(props.date);
        if (dt < DateTime.now().startOf('day')) {
            const duration = time.diffNow('hours');
            setDisabled(duration.hours < -15);
        }
    }, [props.date]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleChange = async (_: any, option: IDropdownOption) => {
        const log: ITaskLog = !isTask(props.task)
            ? props.task
            : await TaskLogsService.createTaskLogFromTask(props.task, props.date);

        const update: Partial<ITaskLog> = {
            Status: option.key as TaskStatus,
        };
        switch (update.Status) {
            case 'Open':
                // If task is not transferable, task stays Completed
                update.Completed = log.Transferable ? false : true;
                break;
            case 'Pending':
                // If task is not transferable, task stays Completed
                update.DateTimeStarted = log.DateTimeStarted ?? new Date();
                update.Completed = log.Transferable ? false : true;
                break;
            case 'Finished':
                update.DateTimeFinished = log.DateTimeFinished ?? new Date();
                update.Completed = true;
                break;
            case 'Cancelled':
                update.Completed = true;
                break;
        }
        try {
            const updated = await TaskLogsService.updateTaskLog(log.ID, update);
            updateTaskLog(updated);
        } catch (err) {
            SPnotify({
                message: err.message,
                messageType: MessageBarType.error,
            });
        }
    };

    const handleHover = (hovering: boolean) => () => {
        setIsHovering(hovering);
    };

    return (
        <Draggable
            key={getTaskUniqueId(props.task)}
            draggableId={getTaskUniqueId(props.task)}
            index={props.index}
        >
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onMouseOver={handleHover(true)}
                    onMouseOut={handleHover(false)}
                >
                    <InnerTask
                        info={info}
                        canEditOthers={canEditOthers}
                        currentUserId={currentUser.User.ID}
                        expired={expired}
                        isHovering={isHovering}
                        onChange={handleChange}
                        theme={TasksWebPart.theme}
                        disabled={disabled}
                        TaskPersona={
                            <TaskPersona
                                title={info.user.Title}
                                email={info.user.EMail}
                                className={styles.Task_person}
                                isHovering={isHovering}
                                taskId={isTask(props.task) ? props.task.ID : props.task.Task.ID}
                                taskLogId={isTask(props.task) ? null : props.task.ID}
                                date={props.date}
                                status={info.status}
                            />
                        }
                    />
                </div>
            )}
        </Draggable>
    );
};

export default Task;
