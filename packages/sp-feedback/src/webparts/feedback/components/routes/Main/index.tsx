import {
    Icon,
    IconButton,
    Label,
    Separator,
    Stack,
    StackItem,
    Text,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { FooterOkCancel, hideDialog, showDialog } from 'sp-components';
import {
    DIALOG_ID,
    SELECTED_VIEW,
} from '../../../constants';
import { $and, $eq, Filter } from '../../../indexes/filter';
import { Item } from '../../../item';
import {
    dispatchItemAdded,
    dispatchItemDeleted,
    dispatchItemUpdated,
} from '../../../services/events';
import {
    changeFilter,
    getEmptySelectedViewFields,
    getViewInfo,
    getSortingFunction,
    SelectedViewInfo,
} from '../../../services/saved-view';
import { BoardView } from '../../BoardView';
import { GlobalContext } from '../../Feedback';
import { FilterBuilder } from '../../FilterBuilder';
import { GroupByField } from '../../FilterBuilder/GroupByField';
import { SortByField } from '../../FilterBuilder/SortByField';
import { useItemModal } from '../../ItemTemplate/ItemModal';
import { BOARD, DOUBLE_COL, TRIPLE_COL } from '../../LayoutSelect';
import { ListView } from '../../ListView';
import { showSaveFilterDialog } from '../../SaveFilterDialog';
import styles from './Main.module.scss';

export interface IMainProps {}

type UseFilterType = {
    filterComponent: JSX.Element;
    selectedFilters: SelectedViewInfo;
};

const useFilterBar = (): UseFilterType => {
    const { indexManager } = React.useContext(GlobalContext);
    const selectedFilters = React.useMemo(
        () => getViewInfo(indexManager),
        [indexManager]
    );

    const handleDelete = React.useCallback(() => {
        showDialog({
            id: DIALOG_ID,
            dialogProps: {
                dialogContentProps: {
                    title: 'Delete saved filter',
                    subText: `Filter '${selectedFilters.selectedTitle}' will be deleted for all users. Proceed?`,
                },
            },
            footer: (
                <FooterOkCancel
                    onOk={() => {
                        hideDialog(DIALOG_ID);
                        dispatchItemDeleted(selectedFilters.selectedItem.Id);
                    }}
                    onCancel={() => hideDialog(DIALOG_ID)}
                />
            ),
        });
    }, [selectedFilters]);

    const component = (
        <div>
            <Stack horizontal tokens={{ childrenGap: '1em' }}>
                <Stack className={styles.filterBox}>
                    <IconButton
                        iconProps={{ iconName: 'Save' }}
                        disabled={!selectedFilters.filterModified}
                        onClick={() => {
                            showSaveFilterDialog(selectedFilters);
                        }}
                    />
                    <IconButton
                        iconProps={{ iconName: 'Refresh' }}
                        disabled={!selectedFilters.filterModified}
                        title="Reset filters"
                        onClick={() => {
                            dispatchItemUpdated(
                                SELECTED_VIEW,
                                getEmptySelectedViewFields(selectedFilters.selectedTitle),
                                { temp: true, persist: true }
                            );
                        }}
                    />
                    <IconButton
                        iconProps={{ iconName: 'Delete' }}
                        title="Delete item"
                        disabled={!selectedFilters.selectedTitle}
                        onClick={handleDelete}
                    />
                </Stack>
                <StackItem className={styles.filterBox}>
                    <Label>
                        <Icon iconName="FilterSolid" /> Filter by
                    </Label>
                    <FilterBuilder
                        filter={selectedFilters.appliedFilter}
                        setFilter={(filter: Filter) => {
                            const newSelected = changeFilter(
                                selectedFilters.tempItem,
                                filter
                            );
                            const options = { temp: true, persist: true };
                            if (!selectedFilters.selectedTitle) {
                                dispatchItemAdded(newSelected.asRaw(), options);
                            } else {
                                dispatchItemUpdated(
                                    SELECTED_VIEW,
                                    newSelected.Fields,
                                    options
                                );
                            }
                        }}
                        defaultFilter={$eq('isservice', 'false')}
                    />
                </StackItem>
                <div className={styles.filterBox}>
                    <GroupByField selectedFilters={selectedFilters} />
                </div>
                <Stack tokens={{ childrenGap: 8 }} className={styles.filterBox}>
                    <SortByField selectedFilters={selectedFilters} />
                </Stack>
            </Stack>
            <Separator />
        </div>
    );

    return {
        filterComponent: component,
        selectedFilters,
    };
};

export const Main: React.FC<IMainProps> = (props) => {
    const { indexManager } = React.useContext(GlobalContext);
    const [items, setItems] = React.useState<Item[]>([]);
    const layout = React.useMemo(() => {
        const viewInfo = getViewInfo(indexManager);
        return viewInfo.appliedLayout;
    }, [indexManager]);
    const { filterComponent, selectedFilters } = useFilterBar();
    const itemModal = useItemModal();

    React.useEffect(() => {
        console.time('filter');
        let filter = $eq('isservice', 'false');
        if (selectedFilters.appliedFilter) {
            filter = $and(selectedFilters.appliedFilter, filter);
        }
        const items = indexManager.filterArray(filter);
        console.timeEnd('filter');
        console.time('sort');
        if (selectedFilters.appliedSortField) {
            items.sort(getSortingFunction(selectedFilters));
        }
        console.timeEnd('sort');
        setItems(items);
    }, [selectedFilters.appliedFilter, indexManager]);

    const columns = React.useMemo(() => {
        switch (layout) {
            case DOUBLE_COL:
                return 2;
            case TRIPLE_COL:
                return 3;
            default:
                return 1;
        }
    }, [items, layout]);

    const body = React.useMemo(() => {
        if (items.length === 0) return (
            <div className={styles.noData}>
                <Text variant="xLarge">Nothing found...</Text>
            </div>
        );
        if (layout === BOARD) {
            return <BoardView items={items} groupField={selectedFilters.appliedGroupField} />
        }
        return (
            <ListView
                items={items}
                groupField={selectedFilters.appliedGroupField}
                columns={columns}
            />
        );
    }, [layout, items]);

    return (
        <div className={styles.container}>
            <div className={styles.filters}>{filterComponent}</div>

            {body}
            {itemModal}
        </div>
    );
};
