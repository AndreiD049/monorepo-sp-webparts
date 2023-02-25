import { openDatabase, removeCached } from 'idb-proxy';
import { ActionButton, Panel, PrimaryButton } from 'office-ui-fabric-react';
import * as React from 'react';
import { useNavigate } from 'react-router';
import { DB_NAME, MAIN_PANEL, STORE_NAME } from '../../../constants';
import { Filter } from '../../../indexes/filter';
import { Item } from '../../../item';
import { GlobalContext } from '../../Feedback';
import { ItemTemplate } from '../../ItemTemplate';
import styles from './Main.module.scss';

export interface IMainProps {
    // Props go here
}

export const Main: React.FC<IMainProps> = (props) => {
    const navigate = useNavigate();
    const { indexManager } = React.useContext(GlobalContext);
    const [value, setValue] = React.useState('');
    const [items, setItems] = React.useState<Item[]>([]);
    
    const handleFilter = (): void => {
        const filter: Filter = JSON.parse(value);
        console.time('filter');
        const items = indexManager.filterArray(filter);
        console.timeEnd('filter');
        setItems(items);
    }
    
    return (
        <div className={styles.container}>
            <div>
                <textarea value={value} onChange={(ev) => setValue(ev.target.value)} />
                <button onClick={handleFilter}>Filter</button>
            </div>
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
