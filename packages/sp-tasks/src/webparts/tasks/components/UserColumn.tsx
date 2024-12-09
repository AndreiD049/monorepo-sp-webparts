import { Persona } from '@fluentui/react';
import { isTask } from '@service/sp-tasks';
import ITask from '@service/sp-tasks/dist/models/ITask';
import ITaskLog from '@service/sp-tasks/dist/models/ITaskLog';
import * as React from 'react';
import { FC } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { TaskGroup } from 'sp-components';
import { ITasksPerUser } from '../hooks/useTasksPerUser';
import GlobalContext from '../utils/GlobalContext';
import { getGroupedTasks, getTaskUniqueId } from '../utils/utils';
import NoTasks from './NoTasks';
import Task from './task/Task';
import styles from './Tasks.module.scss';

export interface IUserColumnsProps {
    tasksPerUser: ITasksPerUser;
    id: number;
    date: Date;
}

export interface ITaskGroupsProps {
    groupName: string;
    tasks: (ITask | ITaskLog)[];
    startIndex: number;
    date: Date;
}

const UserColumn: FC<IUserColumnsProps> = ({ tasksPerUser, id, date }) => {
    const { canEditOthers } = React.useContext(GlobalContext);

    let body: JSX.Element[];

    if (tasksPerUser[id]?.result && tasksPerUser[id]?.result.length > 0) {
        const tasks = tasksPerUser[id]?.result ?? [];
        const grouped = getGroupedTasks(tasks);

        body = [];

        for (let i = 0; i < grouped.length; i++) {
            const group = grouped[i];
            if (group.name === null || group.tasks.length === 1) {
                group.tasks.forEach((task, index) => {
                    body.push(
                        <Task
                            task={task}
                            index={index + group.startIndex}
                            date={date}
                            key={getTaskUniqueId(task)}
                        />
                    );
                });
            } else {
                const statusMap = group.tasks.reduce<{ [status: string]: number }>((prev, cur) => {
                    const status: string = isTask(cur) ? 'Open' : cur.Status;
                    if (prev[status] === undefined) {
                        prev[status] = 0;
                    }
                    prev[status] += 1;
                    return prev;
                }, {});
                body.push(
                    <TaskGroup
                        key={group.name}
                        groupName={group.name}
                        statusMap={statusMap}
                    >
                        {group.tasks.map((t, index) => (
                        <Task
                            key={getTaskUniqueId(t)}
                            task={t}
                            index={index + group.startIndex}
                            date={date}
                        />))}
                    </TaskGroup>
                );
            }
        }
    } else {
        body = [<NoTasks key="notasks" />];
    }

    return (
        <Droppable droppableId={id.toString()} type={canEditOthers ? 'any' : id.toString()}>
            {(provided) => (
                <div
                    className={styles.taskContainer}
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                >
                    <Persona
                        text={tasksPerUser[id]?.user.User.Title}
                        imageUrl={`/_layouts/15/userphoto.aspx?AccountName=${tasksPerUser[id]?.user.User.EMail}&Size=M`}
                    />
                    {body}
                    {provided.placeholder}
                </div>
            )}
        </Droppable>
    );
};

export default UserColumn;
