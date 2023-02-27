import { openDatabase, removeCached } from 'idb-proxy';
import { ActionButton, Panel, PrimaryButton } from 'office-ui-fabric-react';
import * as React from 'react';
import { useNavigate } from 'react-router';
import { DB_NAME, FEEDBACK, MAIN_PANEL, STORE_NAME } from '../../../constants';
import { $eq, parseFilter } from '../../../indexes/filter';
import { Item } from '../../../item';
import { GlobalContext } from '../../Feedback';
import { FilterBuilder } from '../../FilterBuilder';
import { ItemTemplate } from '../../ItemTemplate';
import styles from './Main.module.scss';

export interface IMainProps {
    // Props go here
}

export const Main: React.FC<IMainProps> = (props) => {
    const navigate = useNavigate();
    const { indexManager } = React.useContext(GlobalContext);
    const initialFilter = React.useMemo(() => {
        const localValue = localStorage.getItem("spfx/feedback/last-filter");
        if (localValue) {
            return parseFilter(localValue);
        } else {
            return $eq('tags', FEEDBACK);
        }
    }, []);
    const [filter, setFilter] = React.useState(initialFilter);
    const [items, setItems] = React.useState<Item[]>([]);
    
    React.useEffect(() => {
        console.time('filter');
        const items = indexManager.filterArray(filter);
        console.timeEnd('filter');
        setItems(items);
    }, [filter]);
    
    return (
        <div className={styles.container}>
            <PrimaryButton
                onClick={() => navigate('new?from=/')}
            >
                Leave feedback
            </PrimaryButton>
            <ActionButton
                iconProps={{ iconName: 'Refresh' }}
                onClick={async () => {
                    const db = await openDatabase(DB_NAME, STORE_NAME);
                    await removeCached(db, /.*/);
                    location.reload();
                }}
            />
            <div>
                <FilterBuilder filter={filter} setFilter={(filter) => {
                    localStorage.setItem("spfx/feedback/last-filter", JSON.stringify(filter));
                    setFilter(filter);
                }} />
            </div>
            {items.map((i) => (
                <ItemTemplate
                    style={{ marginTop: '.5em' }}
                    item={i}
                    key={i.Id}
                />
            ))}
            <Panel id={MAIN_PANEL} />
        </div>
    );
};
