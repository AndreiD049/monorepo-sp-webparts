import { ActionButton, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { SELECTED_FILTER } from '../../../constants';
import { $and, $eq, Filter } from '../../../indexes/filter';
import { Item } from '../../../item';
import { MainService } from '../../../services/main-service';
import { GlobalContext } from '../../Feedback';
import { FilterBuilder } from '../../FilterBuilder';
import { ItemTemplate } from '../../ItemTemplate';
import styles from './Main.module.scss';

export interface IMainProps {
    // Props go here
}

export const Main: React.FC<IMainProps> = (props) => {
    const { indexManager } = React.useContext(GlobalContext);
    const selectedFilter: Item = React.useMemo(() => {
        const selectedFilterKey =
            MainService.TempItemService.getTempItem(SELECTED_FILTER);
        const selected: string = selectedFilterKey?.getField('selected');
        const result = selected
            ? indexManager.filterArray($eq('title', selected))[0]
            : new Item();
        return result;
    }, [indexManager]);
    const [filter, setFilter] = React.useState(selectedFilter);
    const [items, setItems] = React.useState<Item[]>([]);

    React.useEffect(() => {
        if (selectedFilter.Title !== filter.Title) {
            setFilter(selectedFilter);
        }
    }, [selectedFilter]);

    React.useEffect(() => {
        console.time('filter');
        const items = indexManager.filterArray(
            $and(filter.getField<Filter>('filter'), $eq('isservice', 'false'))
        );
        console.timeEnd('filter');
        setItems(items);
    }, [selectedFilter, filter, indexManager]);

    return (
        <div className={styles.container}>
            <div className={styles.filters}>
                <Text block variant="mediumPlus">
                    Filters:
                </Text>
                <FilterBuilder
                    filter={filter.getField<Filter>('filter')}
                    setFilter={(filter) => {
                        setFilter(selectedFilter.setField('filter', filter));
                    }}
                    defaultFilter={$eq('isservice', 'false')}
                />
                <ActionButton>Save filter</ActionButton>
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
