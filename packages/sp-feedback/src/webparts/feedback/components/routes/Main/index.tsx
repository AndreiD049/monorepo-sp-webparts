import { Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { FEEDBACK } from '../../../constants';
import { $and, $eq, parseFilter } from '../../../indexes/filter';
import { Item } from '../../../item';
import { GlobalContext } from '../../Feedback';
import { FilterBuilder } from '../../FilterBuilder';
import { ItemTemplate } from '../../ItemTemplate';
import styles from './Main.module.scss';

export interface IMainProps {
    // Props go here
}

export const Main: React.FC<IMainProps> = (props) => {
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
        const items = indexManager.filterArray($and(filter, $eq('isservice', 'false')));
        console.timeEnd('filter');
        setItems(items);
    }, [filter]);
    
    return (
        <div className={styles.container}>
            <div className={styles.filters}>
                <Text block variant='mediumPlus'>Filters:</Text>
                <FilterBuilder filter={filter} setFilter={(filter) => {
                    localStorage.setItem("spfx/feedback/last-filter", JSON.stringify(filter));
                    setFilter(filter);
                }} defaultFilter={$eq('isservice', 'false')} />
            </div>
            {items.map((i) => (
                <ItemTemplate
                    style={{ marginTop: '.5em' }}
                    item={i}
                    key={i.Id}
                />
            ))}
        </div>
    );
};
