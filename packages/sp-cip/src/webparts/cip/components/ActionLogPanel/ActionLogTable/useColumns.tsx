import * as React from 'react';
import { IAction } from '@service/sp-cip/dist/services/action-service';
import {
    IColumn,
    Icon,
    IconButton,
    Persona,
    PersonaSize,
} from 'office-ui-fabric-react';
import styles from './ActionLogTable.module.scss';
import { getActionIconName } from '../../../actionlog/ActionLogItem';
import { GlobalContext } from '../../../utils/GlobalContext';
import { CommentCell } from './CommentCell';
import { TaskCell } from './TaskCell';
import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';

export function useColumns(tasks: ITaskOverview[], handleEdit: (action: IAction, task?: ITaskOverview) => void): IColumn[] {
    const { currentUser } = React.useContext(GlobalContext);

    const columns: IColumn[] = React.useMemo(() => {
        return [
            {
                key: 'Icon',
                name: '',
                minWidth: 50,
                onRender: (item: IAction) => (
                    <Icon
                        className={styles.icon}
                        iconName={getActionIconName(item.ActivityType)}
                    />
                ),
                isResizable: false,
            },
            {
                key: 'Action',
                name: 'Action',
                fieldName: 'ActivityType',
                minWidth: 100,
                isResizable: true,
            },
            {
                key: 'task',
                name: 'Task',
                onRender: (item: IAction) => (<TaskCell action={item} task={tasks.find((t) => t?.Id === item.ItemId)} />),
                isResizable: true,
                minWidth: 150,
            },
            {
                key: 'Comment',
                name: 'Comment',
                fieldName: 'Comment',
                onRender: (item: IAction) => <CommentCell action={item} />,
                minWidth: 250,
                isResizable: true,
            },
            {
                key: 'Created on',
                name: 'Created on',
                fieldName: 'Date',
                onRender: (item: IAction) =>
                    new Date(item.Date).toLocaleString(),
                minWidth: 150,
                isResizable: true,
            },
            {
                key: 'Created by',
                name: 'Created by',
                onRender: (item: IAction) => (
                    <Persona
                        text={item.User.Title}
                        imageUrl={`/_layouts/15/userphoto.aspx?AccountName=${item.User.EMail}&Size=M`}
                        size={PersonaSize.size24}
                    />
                ),
                minWidth: 150,
                isResizable: true,
            },
            {
                key: 'Actions',
                name: '',
                minWidth: 70,
                onRender: (item: IAction) => {
                    // Edit is possible only for time logs
                    if (item.ActivityType !== 'Time log') return null;
                    if (currentUser?.Id === item.Author.Id)
                        return <IconButton onClick={() => handleEdit(item, tasks.find((t) => t?.Id === item.ItemId))} iconProps={{ iconName: 'Edit' }} />;
                },
                isResizable: true,
            },
        ];
    }, [currentUser, tasks]);

    return columns;
}
