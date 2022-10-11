import { IAction } from '@service/sp-cip/dist/services/action-service';
import {
    DetailsList,
    DetailsListLayoutMode,
    IColumn,
    Icon,
    IconBase,
    IconButton,
    IGroup,
    Persona,
    PersonaSize,
    SelectionMode,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { getActionIconName } from '../../../actionlog/ActionLogItem';
import MainService from '../../../services/main-service';
import { HOUR } from '../../../utils/constants';
import { GlobalContext } from '../../../utils/GlobalContext';
import styles from './ActionLogTable.module.scss';

export interface IActionLogTableProps {
    dateFrom: Date;
    dateTo: Date;
}

export const ActionLogTable: React.FC<IActionLogTableProps> = (props) => {
    const { currentUser } = React.useContext(GlobalContext);
    const actionService = React.useMemo(
        () => MainService.getActionService(),
        []
    );
    const [items, setItems] = React.useState<IAction[]>([]);

    const columns: IColumn[] = React.useMemo(() => {
        return [
            {
                key: 'Icon',
                name: '',
                minWidth: 50,
                onRender: (item: IAction) => <Icon className={styles.icon} iconName={getActionIconName(item.ActivityType)} />,
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
                key: 'Comment',
                name: 'Comment',
                fieldName: 'Comment',
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
                    if (currentUser?.Id === item.Author.Id) return (
                        <IconButton iconProps={{ iconName: 'Edit' }} />
                    );
                },
                isResizable: true,
            },
        ];
    }, [currentUser]);

    React.useEffect(() => {
        async function run() {
            const actions = await actionService.getActionsFromTo(
                props.dateFrom,
                new Date(props.dateTo.getTime() + HOUR * 24)
            );
            actions.sort((a, b) => a.Date < b.Date ? 1 : -1);
            setItems(actions);
        }
        run();
    }, [props.dateFrom, props.dateTo]);

    const groups = React.useMemo(() => {
        const result = new Map<string, IGroup>();
        for (let i = 0; i < items.length; i++) {
            const element = items[i];
            const dt = new Date(element.Date).toDateString();
            if (!result.has(dt)) {
                result.set(dt, {
                    key: dt,
                    name: dt,
                    startIndex: i,
                    count: 0,
                });
            }
            const prev = result.get(dt);
            result.set(dt, { ...prev, count: prev.count + 1 });
        }
        return Array.from(result.values());
    }, [items]);

    return (
        <DetailsList
            items={items}
            groups={groups}
            columns={columns}
            layoutMode={DetailsListLayoutMode.fixedColumns}
            selectionMode={SelectionMode.none}
        />
    );
};
