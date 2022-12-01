import * as React from 'react';
import { IColumn, Icon } from 'office-ui-fabric-react';
import { IUserListInfo } from '@service/users';
import { UserColumnHeader } from './UserColumnHeader';
import { UserCell } from './UserCell';
import { IProcessFlowRow } from '../../models/IProcessFlowRow';

interface IProcessColumnProps {
    locations: string[];
    users: IUserListInfo['User'][];
}

const defaultColumns: IColumn[] = [
    {
        key: 'System',
        minWidth: 100,
        name: 'System',
        isResizable: true,
        onRender(item) {
            return item.process.System;
        },
    },
    {
        key: 'Process',
        minWidth: 350,
        name: 'Process',
        isResizable: true,
        onRender(item) {
            return item.process.Process;
        },
    },
];

const addNewLocationColumn: IColumn = {
    key: 'newLocation',
    minWidth: 15,
    maxWidth: 15,
    isResizable: false,
    isCollapsible: false,
    name: 'newLocation',
    styles: {
        root: {
            padding: 0,
        },
        cellTitle: {
            padding: 0,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'visible',
        },
    },
    onRenderHeader: () => {
        return (
            <Icon
                iconName="AddTo"
                styles={{
                    root: {
                        maxWidth: 30,
                    },
                }}
            />
        );
    },
};

const uomColumn: IColumn = {
    key: 'UOM',
    name: 'UOM',
    minWidth: 50,
    onRender: (item) => item.process?.UOM || 'N/A',
}

const allocationColumns: IColumn = {
    key: 'Allocation',
    name: 'Allocation',
    minWidth: 75,
    onRender: (item) => item.process?.Allocation || 'N/A',
}

export const useColumns = (props: IProcessColumnProps): IColumn[] => {
    const columns = React.useMemo(() => {
        const locations: IColumn[] = props.locations.map((l) => ({
            key: l,
            name: l.toUpperCase(),
            isResizable: true,
            minWidth: 50,
            onRender(item, _index, column) {
                return item.locations[column.name]?.DoneBy.join('/') || 'N/A';
            },
        }));
        const users: IColumn[] = props.users.map((u) => ({
            key: u.Title,
            name: u.Title,
            minWidth: 150,
            data: u,
            isResizable: true,
            styles: {
                cellTitle: {
                    justifyContent: 'center',
                },
            },
            isPadded: false,
            onRender(item: IProcessFlowRow) {
                const users = item.users;
                return <UserCell process={item.process} userProcess={users[u.Id]} user={u} />
            },
            onRenderHeader: (props, defaultRender) => {
                return (<UserColumnHeader columnData={props} defaultRender={defaultRender} />)
            },
        }));
        return [...defaultColumns, addNewLocationColumn, ...locations, ...users, allocationColumns, uomColumn];
    }, [props]);

    return columns;
};
