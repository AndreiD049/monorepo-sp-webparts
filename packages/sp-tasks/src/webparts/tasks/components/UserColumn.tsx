import { Persona } from 'office-ui-fabric-react';
import * as React from 'react';
import { FC } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { ITasksPerUser } from '../hooks/useTasksPerUser';
import GlobalContext from '../utils/GlobalContext';
import { getTaskUniqueId } from '../utils/utils';
import NoTasks from './NoTasks';
import Task from './task/Task';
import styles from './Tasks.module.scss';

export interface IUserColumnsProps {
    tasksPerUser: ITasksPerUser;
    id: number;
    date: Date;
}

const UserColumn: FC<IUserColumnsProps> = ({ tasksPerUser, id, date }) => {
    const { canEditOthers } = React.useContext(GlobalContext);

    let body: JSX.Element[] | JSX.Element;

    if (tasksPerUser[id]?.result && tasksPerUser[id]?.result.length > 0) {
        body = tasksPerUser[id]?.result.map((task, index) => (
            <Task
                task={task}
                index={index}
                date={date}
                key={getTaskUniqueId(task)}
            />
        ));
    } else {
        body = <NoTasks />
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
