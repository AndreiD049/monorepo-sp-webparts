import {
    Dropdown,
    IconButton,
    IDropdownOption,
    Label,
    Separator,
    Stack,
    StackItem,
} from 'office-ui-fabric-react';
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
    getSelectedFilterInfo,
    getSortingFunction,
    SelectedFilterInfo,
} from '../../../services/saved-filter';
import { GlobalContext } from '../../Feedback';
import { FilterBuilder } from '../../FilterBuilder';
import { DOUBLE_COL, SINGLE_COL, TRIPLE_COL } from '../../LayoutSelect';
import { ListView } from '../../ListView';
import { showSaveFilterDialog } from '../../SaveFilterDialog';
import styles from './Main.module.scss';

export interface IMainProps {}

type UseFilterType = {
    filterComponent: JSX.Element;
    selectedFilters: SelectedFilterInfo;
};

const SelectField: React.FC<{
    filter: Filter;
    label: string;
    value: string;
    additionalOptions?: IDropdownOption[];
    onChange: (opt: string | undefined | number) => void;
}> = (props) => {
    const { indexManager } = React.useContext(GlobalContext);
    const options = React.useMemo(
        () => indexManager.getFields(props.filter),
        [indexManager]
    );
    const dropdownOptions: IDropdownOption[] = React.useMemo(() => {
        const result = props.additionalOptions || [];
        return [
            ...result,
            ...options.map((o) => ({
                key: o,
                data: o,
                text: o,
            })),
        ];
    }, [options]);

    return (
        <div>
            <Dropdown
                options={dropdownOptions}
                dropdownWidth="auto"
                label={props.label}
                selectedKey={props.value || null}
                onChange={(_ev, option) => {
                    props.onChange(option.data);
                }}
            />
        </div>
    );
};

const useFilterBar = (): UseFilterType => {
    const { indexManager } = React.useContext(GlobalContext);
    const selectedFilters = React.useMemo(
        () => getSelectedFilterInfo(indexManager),
        [indexManager]
    );

    const handleSetField =
        (field: string): ((opt: string | null) => void) =>
        (opt: string | null) => {
            if (!selectedFilters.tempItem) {
                const newItem = new Item()
                    .setTitle(SELECTED_FILTER)
                    .setField(field, opt);
                dispatchItemAdded(newItem.asRaw(), {
                    temp: true,
                    persist: true,
                });
            } else {
                const newItem = selectedFilters.tempItem.setField(field, opt);
                dispatchItemUpdated(SELECTED_FILTER, newItem.Fields, {
                    temp: true,
                    persist: true,
                });
            }
        };

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
                                SELECTED_FILTER,
                                {
                                    filter: undefined,
                                    group: undefined,
                                    sort: undefined,
                                },
                                { temp: true, persist: true }
                            );
                        }}
                    />
                    <IconButton
                        iconProps={{ iconName: 'Delete' }}
                        title="Delete item"
                        disabled={!selectedFilters.selectedTitle}
                    />
                </Stack>
                <StackItem className={styles.filterBox}>
                    <Label>Filter by</Label>
                    <FilterBuilder
                        filter={selectedFilters.appliedFilter}
                        setFilter={(filter: Filter) => {
                            const newSelected = getNewSelectedFilter(
                                selectedFilters.selectedTitle,
                                filter,
                                selectedFilters.appliedSortField,
                                selectedFilters.appliedSortAsc,
                                selectedFilters.appliedGroupField
                            );
                            const options = { temp: true, persist: true };
                            if (!selectedFilters.selectedTitle) {
                                dispatchItemAdded(newSelected.asRaw(), options);
                            } else {
                                dispatchItemUpdated(
                                    SELECTED_FILTER,
                                    newSelected.Fields,
                                    options
                                );
                            }
                        }}
                        defaultFilter={$eq('isservice', 'false')}
                    />
                </StackItem>
                <div className={styles.filterBox}>
                    <SelectField
                        filter={selectedFilters.appliedFilter}
                        value={selectedFilters.appliedGroupField || 'null'}
                        label="Group by"
                        onChange={handleSetField('group')}
                        additionalOptions={[
                            {
                                key: 'null',
                                data: null,
                                text: '---',
                            },
                        ]}
                    />
                </div>
                <Stack tokens={{ childrenGap: 8 }} className={styles.filterBox}>
                    <SelectField
                        filter={selectedFilters.appliedFilter}
                        value={selectedFilters.appliedSortField}
                        label="Sort by"
                        onChange={handleSetField('sort')}
                    />
                    <Dropdown
                        selectedKey={
                            selectedFilters.appliedSortAsc === true
                                ? 'asc'
                                : 'desc'
                        }
                        options={[
                            { key: 'asc', text: 'asc' },
                            { key: 'desc', text: 'desc' },
                        ]}
                        onChange={(_ev, opt) =>
                            handleSetField('sortdir')(opt.key.toString())
                        }
                    />
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
        const selected =
            indexManager.filterFirst($eq('title', SELECTED_LAYOUT)) ||
            new Item();
        return selected.getFieldOr('layout', SINGLE_COL);
    }, [indexManager]);
    const { filterComponent, selectedFilters } = useFilterBar();

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

    return (
        <div className={styles.container}>
            <div className={styles.filters}>{filterComponent}</div>

            <ListView
                items={items}
                groupField={selectedFilters.appliedGroupField}
                columns={columns}
            />
        </div>
    );
};
