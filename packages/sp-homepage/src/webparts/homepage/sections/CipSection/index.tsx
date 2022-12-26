import * as React from 'react';
import { CipTask } from '../../components/CipTask';
import { GlobalContext } from '../../context/GlobalContext';
import { IColumn, DetailsList, SelectionMode, DetailsListLayoutMode } from 'office-ui-fabric-react';
import { ISectionProps } from '../../components/Section';
import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import { createTaskTree } from '@service/sp-cip';
import { flatten } from '@microsoft/sp-lodash-subset';
import { useGroups } from '../../components/CipTask/useGroups';
import { CipSectionContext } from './CipSectionContext';
import { NoData } from '../../components/NoData';
import { ICipService, useTasks } from './useTasks';
import { ISiteUserInfo } from 'sp-preset';
import { getSourceKey } from '../../utils';
import { CIP_SPINNER_ID } from '../../constants';
import { LoadingSpinner } from 'sp-components';
import styles from './CipSection.module.scss';

export interface ICipSectionProps extends ISectionProps {
    // Props go here
}

// Task details with information on it's original source
export interface ITaskOverviewWithSource extends ITaskOverview {
    service: ICipService;
}


export const CipSection: React.FC<ICipSectionProps> = (props) => {
    const { selectedUser } = React.useContext(GlobalContext);
    const [status, setStatus] = React.useState<string[]>([]);
    const [priority, setPriority] = React.useState<string[]>([]);
    const [siteUsers, setSiteUsers] = React.useState<{ [key: string]: ISiteUserInfo[] }>({});
    const { tasks, services, loaded } = useTasks(props.section.sources, props.section.name, selectedUser);

    // Fetch field choices and site users
    React.useEffect(() => {
        async function run(): Promise<void> {
            const firstKey = Object.keys(services)[0];
            const service = services[firstKey];
            const status = await service.getStatusChoice();
            setStatus(status.Choices || []);
            const priority = await service.getPriorityChoice();
            setPriority(priority.Choices || []);
            const siteUsers: { [key: string]: ISiteUserInfo[] } = {};
            for (const key in services) {
                if (Object.prototype.hasOwnProperty.call(services, key)) {
                    const service = services[key];
                    siteUsers[getSourceKey(service.source)] = await service.getSiteUsers();
                }
            }
            setSiteUsers(siteUsers);
        }
        run().catch((err) => console.error(err));
    }, [services]);

    const treeRoots = React.useMemo(() => {
        const result = [];
        for (const key in tasks) {
            if (Object.prototype.hasOwnProperty.call(tasks, key)) {
                const items = tasks[key];
                result.push(createTaskTree(items));
            }
        }
        return result;
    }, [tasks]);

    const children = React.useMemo(() => {
        return flatten(treeRoots.map((root) => root.getChildren())).sort((a, b) =>
            a.Category < b.Category ? -1 : 1
        );
    }, [treeRoots]);

    const { groups } = useGroups(children, (c) => c.Category);

    const columns: IColumn[] = React.useMemo(() => {
        return [
            {
                key: 'Title',
                name: 'Title',
                minWidth: 300,
                isResizable: true,
            },
            {
                key: 'Actions',
                name: 'Actions',
                minWidth: 100,
                isResizable: false,
            },
            {
                key: 'Status',
                name: 'Status',
                minWidth: 100,
                isResizable: false,
            },
            {
                key: 'Priority',
                name: 'Priority',
                minWidth: 100,
                isResizable: false,
            },
            {
                key: 'DueDate',
                name: 'DueDate',
                minWidth: 100,
                isResizable: true,
            },
        ];
    }, []);

    if (!loaded) {
        return <LoadingSpinner />
    }

    if (children.length === 0) {
        return <NoData />;
    }

    return (
        <>
            <CipSectionContext.Provider
                value={{
                    statusChoices: status,
                    priorityChoices: priority,
                    siteUsers,
                }}
            >
                <div className={styles.container}>
                    <LoadingSpinner id={CIP_SPINNER_ID} />
                    <DetailsList
                        className={styles.table}
                        groups={groups}
                        items={children}
                        getKey={(item) =>
                            `${item.getTask().service.source.rootUrl}/${item.getTask().Id}`
                        }
                        columns={columns}
                        selectionMode={SelectionMode.none}
                        onRenderRow={(props) => {
                            return <CipTask rowProps={props} />;
                        }}
                        layoutMode={DetailsListLayoutMode.fixedColumns}
                    />
                </div>
            </CipSectionContext.Provider>
        </>
    );
};
