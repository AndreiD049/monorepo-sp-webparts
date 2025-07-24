import * as React from 'react';
import { getTheme, IColumn } from '@fluentui/react';
import { IUserListInfo } from '@service/users';
import { UserColumnHeader } from './UserColumnHeader';
import { UserCell } from './UserCell';
import { IProcessFlowRow } from '../../models/IProcessFlowRow';
import styles from './ProcessFlowTable.module.scss';
import { ProcessCell } from './ProcessCell';
import { LocationCell } from './LocationCell';
import { PROCESS_COLUMN_WIDTH, LOCATION_COLUMN_WIDTH } from '../../utils/constants';

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
        minWidth: 400,
        name: 'Process',
        isResizable: false,
        styles: {
            root: {
                borderRight: '1px solid ' + theme.palette.neutralLighter,
                position: 'sticky',
                zIndex: 100,
                left: 0,
                backgroundColor: 'white',
            },
        },
        onRender(item) {
            return <ProcessCell process={item.process} />;
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
        const locations: IColumn[] = props.locations.map((l, i) => ({
            key: l,
            name: l.toUpperCase(),
            isResizable: false,
            minWidth: 50,
            styles: {
                root: {
                    position: 'sticky',
                    zIndex: 100,
                    left: PROCESS_COLUMN_WIDTH + (i * LOCATION_COLUMN_WIDTH),
                    backgroundColor: 'white',
                },
            },
            onRender(item, _index, column) {
                return (
                    <LocationCell
                        location={item.locations[column.name]}
                        processId={item.process.Id}
                        title={l}
                        index={i}
                        key={column.name + String(i)} // re-render the column when team changes; Needed for sticky column
                    />
                );
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
