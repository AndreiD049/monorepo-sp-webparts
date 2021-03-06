import { DateTime } from 'luxon';
import { Dropdown, Icon, IconButton, IDropdownOption, Separator, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { FC } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { updateTaskLog } from '../../hooks/useTasks';
import ITask from '../../models/ITask';
import ITaskLog, { TaskStatus } from '../../models/ITaskLog';
import { ITaskInfo } from '../../models/ITaskProperties';
import { MINUTE } from '../../utils/constants';
import GlobalContext from '../../utils/GlobalContext';
import { getTaskUniqueId, isTask } from '../../utils/utils';
import { TaskPersona } from './Persona/TaskPersona';
import styles from './Task.module.scss';
import colors from './Colors.module.scss';

const CLOSED_ICON = 'ChevronDown';
const OPEN_ICON = 'ChevronUp';
const DROPDOWN_STYLES = {
    caretDownWrapper: {
        display: 'none',
    },
    title: {
        border: 'none',
        height: '1.5em',
        lineHeight: '1.5em',
        minWidth: '100px',
    },
    dropdownItemSelected: {
        minHeight: '1.7em',
        lineHeight: '1.7em',
    },
    dropdownItem: {
        minHeight: '1.7em',
        lineHeight: '1.7em',
    },
    dropdown: {
        fontSize: '.8em',
    },
    dropdownOptionText: {
        fontSize: '.8em',
    },
};
const DROPDOWN_KEYS: { key: TaskStatus; text: string }[] = [
    {
        key: 'Open',
        text: 'Open',
    },
    {
        key: 'Pending',
        text: 'In progress',
    },
    {
        key: 'Finished',
        text: 'Finished',
    },
    {
        key: 'Cancelled',
        text: 'Cancelled',
    },
];

export interface ITaskProps {
    task: ITaskLog | ITask;
    index: number;
    date: Date;
}

const Task: FC<ITaskProps> = (props) => {
    const { TaskLogsService, canEditOthers, currentUser } = React.useContext(GlobalContext);
    const [open, setOpen] = React.useState<boolean>(false);
    const [expired, setExpired] = React.useState<boolean>(false);
    const [isHovering, setIsHovering] = React.useState<boolean>(false);

    let info: ITaskInfo = React.useMemo(() => {
        if (isTask(props.task)) {
            return {
                description: props.task.Description,
                title: props.task.Title,
                user: props.task.AssignedTo,
                date: DateTime.fromJSDate(props.date).toLocaleString(DateTime.DATE_SHORT),
                time: DateTime.fromISO(props.task.Time).toLocaleString(DateTime.TIME_24_SIMPLE),
                status: 'Open',
            };
        }
        return {
            description: props.task.Description || '',
            remark: props.task.Remark,
            title: props.task.Title,
            user: props.task.User,
            date: DateTime.fromISO(props.task.Date).toLocaleString(DateTime.DATE_SHORT),
            time: DateTime.fromISO(props.task.Time || props.task.Task?.Time).toLocaleString(
                DateTime.TIME_24_SIMPLE
            ),
            status: props.task.Status,
        };
    }, [props.task]);

    React.useEffect(() => {
        function checkExpired() {
            const dt = isTask(props.task)
                ? DateTime.fromJSDate(props.date)
                : DateTime.fromISO(props.task.Date);
            const time = DateTime.fromISO(info.time).set({
                day: dt.day,
                month: dt.month,
                year: dt.year,
            });
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
    }, [info, props.task]);

    const body = React.useMemo(() => {
        if (!open) return null;
        return (
            <>
                {info.remark && (
                    <>
                        <Text className={styles['Task__remark-label']} variant="smallPlus">
                            Remark:
                        </Text>
                        <Text className={styles.description} variant="smallPlus">
                            {info.remark}
                        </Text>
                    </>
                )}
                {info.description && (
                    <>
                        <Text className={styles['Task__remark-label']} variant="smallPlus">
                            Description:
                        </Text>
                        <Text className={styles.description} variant="smallPlus">
                            {info.description}
                        </Text>
                    </>
                )}
            </>
        );
    }, [open]);

    const toggleOpen = React.useCallback(() => {
        setOpen((prev) => !prev);
    }, []);

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
        const updated = await TaskLogsService.updateTaskLog(log.ID, update);
        updateTaskLog(updated);
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
                    className={`${styles.task} ${colors[info.status.toLowerCase()]}`}
                    onMouseOver={handleHover(true)}
                    onMouseOut={handleHover(false)}
                >
                    <div className={styles.header}>
                        {info.remark && (<Icon className={styles['Task__remark-icon']} iconName='InfoSolid' title='Has remark' />)}
                        <Text className={`${expired && styles.expired} ${styles['Task__title']}`} variant="mediumPlus">
                            {info.title}
                        </Text>
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
                    </div>
                    <div className={styles.subheader}>
                        <Text variant="medium">{info.date}</Text>
                        <Text variant="medium" className={styles.hours}>
                            {' '}
                            {info.time}{' '}
                        </Text>
                    </div>
                    <div className={styles.status}>
                        <Text variant="medium">Status:</Text>
                        <Dropdown
                            options={DROPDOWN_KEYS}
                            styles={DROPDOWN_STYLES}
                            selectedKey={info.status}
                            onChange={
                                info.user.ID === currentUser.User.ID || canEditOthers
                                    ? handleChange
                                    : null
                            }
                            disabled={info.user.ID === currentUser.User.ID ? false : !canEditOthers}
                        />
                    </div>
                    {info.description || info.remark ? (
                        <div className={styles.body}>
                            <IconButton
                                onClick={toggleOpen}
                                iconProps={{
                                    iconName: open ? OPEN_ICON : CLOSED_ICON,
                                }}
                            />
                            {body}
                        </div>
                    ) : null}
                </div>
            )}
        </Draggable>
    );
};

export default Task;
