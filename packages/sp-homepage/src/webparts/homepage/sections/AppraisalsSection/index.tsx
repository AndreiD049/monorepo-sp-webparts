import { Checkbox, MessageBarType, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { LoadingSpinner } from 'sp-components';
import { SPnotify } from 'sp-react-notifications';
import { ExpandHeader } from '../../components/ExpandHeader';
import { NoData } from '../../components/NoData';
import { Pill } from '../../components/Pill';
import { listenSectionEvent } from '../../components/Section/section-events';
import { GlobalContext } from '../../context/GlobalContext';
import IAppraisalItem, { AppraisalItemStatus } from '../../models/IAppraisalItem';
import ISectionProps from '../../models/ISectionProps';
import SourceService from '../../services/SourceService';
import styles from './AppraisalsSection.module.scss';

const select = ['Id', 'Content', 'ItemType', 'ItemStatus', 'PlannedIn/Id', 'PlannedIn/Title'];
const expand = ['PlannedIn'];

export interface IAppraisalsSectionProps extends ISectionProps { }

const pillColors: { [key: string]: string } = {
    Objective: '#ffebc0',
    Training: '#caf0cc',
};

const AppraisalItem: React.FC<{
    item: IAppraisalItem;
    handleUpdate: (id: number, status: AppraisalItemStatus) => void;
}> = ({ item, handleUpdate }) => {
    return (
        <div className={styles.item}>
            <Checkbox
                checked={item.ItemStatus === 'Achieved'}
                onChange={(_ev, checked) => handleUpdate(item.Id, checked ? 'Achieved' : 'Planned')}
            />
            {/* Status */}
            <Pill style={{ backgroundColor: pillColors[item.ItemType] }} className={styles.pill}>
                <Text variant="medium">{item.ItemType}</Text>
            </Pill>
            {/* Content */}
            <span className={item.ItemStatus === 'Achieved' ? styles.contentAchieved : null}>{item.Content}</span>
        </div>
    );
};

export const AppraisalsSection: React.FC<IAppraisalsSectionProps> = (props) => {
    const { selectedUser } = React.useContext(GlobalContext);
    const [loading, setLoading] = React.useState(true);
    const service = React.useMemo(
        () => new SourceService(props.section.sources[0], select, expand),
        [props.section]
    );
    const [data, setData] = React.useState<IAppraisalItem[]>([]);
    const [reload, setReload] = React.useState<boolean>(false);

    // Objectives and trainings are grouped by the period
    // they were planned in
    const grouped = React.useMemo(() => {
        const sorted = [...data];
        sorted.sort((a, b) => a.PlannedIn.Id - b.PlannedIn.Id);
        const result: { [period: string]: IAppraisalItem[] } = {};
        sorted.forEach((item) => {
            if (!(item.PlannedIn.Title in result)) {
                result[item.PlannedIn.Title] = [];
            }
            result[item.PlannedIn.Title].push(item);
        });
        return result;
    }, [data]);

    // Fetch data
    React.useEffect(() => {
        async function run(): Promise<void> {
            try {
                setData(await service.getSourceData());
            } finally {
                setLoading(false);
            }
        }
        run().catch((err) =>
            SPnotify({
                message: err.message,
                messageType: MessageBarType.error,
            })
        );
    }, [props.section, reload]);

    // Listen events
    React.useEffect(() => {
        const listenHandlerRemove = listenSectionEvent(props.section.name, 'REFRESH', async () => {
            setLoading(true);
            // Clear cache
            await service.clearCache();
            // Reload and fetch data again
            setReload((prev) => !prev);
        });
        return () => {
            listenHandlerRemove();
        };
    }, [props.section, selectedUser]);

    const handleItemUpdate = async (id: number, status: AppraisalItemStatus): Promise<void> => {
        console.log('update', status);
        const updateBody: Partial<IAppraisalItem> = {
            ItemStatus: status,
        };
        if (status === 'Planned') {
            updateBody.AchievedInId = null;
        }
        const newItem = await service.updateItem<IAppraisalItem>(id, updateBody);
        setData((prev) => prev.map((i) => (i.Id === newItem.Id ? newItem : i)));
    };

    let body;
    if (data.length > 0) {
        body = Object.keys(grouped).map((k) => (
            <ExpandHeader key={k} header={k}>
                {grouped[k].map((item) => (
                    <AppraisalItem key={item.Id + item.Content + item.ItemStatus} item={item} handleUpdate={async (id, status) => {
                        try {
                            setLoading(true);
                            await handleItemUpdate(id, status);
                        } finally {
                            setLoading(false);
                        }
                    }} />
                ))}
            </ExpandHeader>
        ));
    } else {
        body = <NoData />;
    }

    return (
        <div className={styles.container}>
            {loading ? <LoadingSpinner /> : null }
            {body}
        </div>
    );
};
