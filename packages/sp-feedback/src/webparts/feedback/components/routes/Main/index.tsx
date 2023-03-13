import { Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { SELECTED_FILTER, SELECTED_LAYOUT } from '../../../constants';
import { $and, $eq, Filter } from '../../../indexes/filter';
import { Item } from '../../../item';
import {
    dispatchItemAdded,
    dispatchItemUpdated,
} from '../../../services/events';
import {
    getNewSelectedFilter,
    getFilterApplied,
    getSelectedFilterInfo,
} from '../../../services/saved-filter';
import { GlobalContext } from '../../Feedback';
import { FilterBuilder } from '../../FilterBuilder';
import { DOUBLE_COL, SINGLE_COL, TRIPLE_COL } from '../../LayoutSelect';
import { NColumnLayout } from '../../NColumnLayout';
import { SingleColumnLayout } from '../../SingleColumnLayout';
import styles from './Main.module.scss';

export interface IMainProps {
    // Props go here
}

export const Main: React.FC<IMainProps> = (props) => {
    const { indexManager } = React.useContext(GlobalContext);
    const selectedFilters = React.useMemo(
        () => getSelectedFilterInfo(indexManager),
        [indexManager]
    );
    const [items, setItems] = React.useState<Item[]>([]);
    const layout = React.useMemo(() => {
        const selected = indexManager.filterFirst($eq('title', SELECTED_LAYOUT)) || new Item();
        return selected.getFieldOr('layout', SINGLE_COL);
    }, [indexManager]);

    React.useEffect(() => {
        console.time('filter');
        const items = indexManager.filterArray(
            $and(getFilterApplied(selectedFilters), $eq('isservice', 'false'))
        );
        console.timeEnd('filter');
        setItems(items);
    }, [selectedFilters]);

    const list = React.useMemo(() => {
        switch (layout) {
            case DOUBLE_COL:
                return <NColumnLayout items={items} cols={2} />
            case TRIPLE_COL:
                return <NColumnLayout items={items} cols={3} />
            default:
                return <SingleColumnLayout items={items} />
        }
    }, [items, layout]);

    return (
        <div className={styles.container}>
            <div className={styles.filters}>
                <Text block variant="mediumPlus">
                    Filters:
                </Text>
                <FilterBuilder
                    filter={getFilterApplied(selectedFilters)}
                    setFilter={(filter: Filter) => {
                        const newSelected = getNewSelectedFilter(
                            selectedFilters.selectedTitle,
                            filter
                        );
                        const options = { temp: true, persist: true };
                        if (!selectedFilters.selectedTitle) {
                            dispatchItemAdded(newSelected.asRaw(), options);
                        } else {
                            dispatchItemUpdated(
                                SELECTED_FILTER,
                                newSelected,
                                options
                            );
                        }
                    }}
                    defaultFilter={$eq('isservice', 'false')}
                />
            </div>

            {list}
        </div>
    );
};
