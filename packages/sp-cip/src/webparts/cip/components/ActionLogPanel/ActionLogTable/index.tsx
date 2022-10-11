import { IAction } from '@service/sp-cip/dist/services/action-service';
import { DetailsList, DetailsListLayoutMode, IColumn } from 'office-ui-fabric-react';
import * as React from 'react';
import MainService from '../../../services/main-service';
import styles from './ActionLogTable.module.scss';

export interface IActionLogTableProps {
    dateFrom: Date;
    dateTo: Date;
}

export const ActionLogTable: React.FC<IActionLogTableProps> = (props) => {
    const actionService = React.useMemo(() => MainService.getActionService(), []);
    const [items, setItems] = React.useState<IAction[]>([]);

    const columns: IColumn[] = React.useMemo(() => {
        return [
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
                minWidth: 200,
                isResizable: true,
            },
            {
                key: 'Created on',
                name: 'Created on',
                fieldName: 'Date',
                minWidth: 100,
                isResizable: true,
            },
            {
                key: 'Created by',
                name: 'Created by',
                onRender: (item: IAction) => item.User.Title,
                minWidth: 100,
                isResizable: true,
            },
            {
                key: 'Actions',
                name: '',
                minWidth: 70,
                isResizable: true,
            }
        ]
    }, []);

    React.useEffect(() => {
        async function run() {
            const actions = await actionService.getActionsFromTo(props.dateFrom, props.dateTo);
            console.log(actions);
            setItems(actions);
        }
        run();
    }, [props.dateFrom, props.dateTo]);

    return (
        <DetailsList
            items={items}
            columns={columns}
            layoutMode={DetailsListLayoutMode.fixedColumns}
        />
    );
};
