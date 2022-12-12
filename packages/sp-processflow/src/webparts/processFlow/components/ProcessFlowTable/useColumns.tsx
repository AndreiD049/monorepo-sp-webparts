import * as React from 'react';
import { getTheme, IColumn } from 'office-ui-fabric-react';
import { IUserListInfo } from '@service/users';
import { UserColumnHeader } from './UserColumnHeader';
import { UserCell } from './UserCell';
import { IProcessFlowRow } from '../../models/IProcessFlowRow';
import styles from './ProcessFlowTable.module.scss';
import { ProcessCell } from './ProcessCell';

interface IProcessColumnProps {
    locations: string[];
    users: IUserListInfo['User'][];
}

const theme = getTheme();

const fixedHeader: IColumn['onRenderHeader'] = (props, defaultRender) => {
    return <div className={styles.tableHeaderText}>{defaultRender(props)}</div>;
};

const defaultColumns: IColumn[] = [
    {
        key: 'System',
        minWidth: 100,
        name: 'System',
        isResizable: true,
        onRender(item) {
            return item.process.System;
        },
        onRenderHeader: fixedHeader,
    },
    {
        key: 'Process',
        minWidth: 350,
        name: 'Process',
        isResizable: true,
        styles: {
            root: {
                borderRight: '1px solid ' + theme.palette.neutralLighter,
            },
        },
        onRender(item) {
            return <ProcessCell process={item.process} />
        },
        onRenderHeader: fixedHeader,
    },
];

const uomColumn: IColumn = {
    key: 'UOM',
    name: 'UOM',
    minWidth: 50,
    onRender: (item) => item.process?.UOM || null,
    onRenderHeader: fixedHeader,
};

const allocationColumns: IColumn = {
    key: 'Allocation',
    name: 'Allocation',
    minWidth: 75,
    onRender: (item) => item.process?.Allocation || null,
    onRenderHeader: fixedHeader,
};

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
            onRenderHeader: fixedHeader,
        }));
        const users: IColumn[] = props.users.map((u) => ({
            key: u.Title,
            name: u.Title,
            minWidth: 90,
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
                return (
                    <UserCell
                        process={item.process}
                        userProcess={users[u.Id]}
                        user={u}
                    />
                );
            },
            onRenderHeader: (props, defaultRender) => {
                return (
                    <UserColumnHeader
                        columnData={props}
                        defaultRender={defaultRender}
                    />
                );
            },
        }));
        return [
            ...defaultColumns,
            ...locations,
            ...users,
            allocationColumns,
            uomColumn,
        ];
    }, [props]);

    return columns;
};
