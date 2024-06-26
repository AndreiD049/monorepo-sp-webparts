import { Icon, Label, Stack } from 'office-ui-fabric-react';
import * as React from 'react';
import { SELECTED_VIEW } from '../../constants';
import { dispatchItemUpdated } from '../../services/events';
import {
    changeSort,
    getEmptySelectedView,
    SelectedViewInfo,
} from '../../services/saved-view';
import { GlobalContext } from '../Feedback';
import {
    hideListOptionsCallout,
    makeSimpleListOption,
    showListOptionsCallout,
} from '../OptionList';
import styles from './FilterBuilder.module.scss';

export interface IGroupByField {
    selectedFilters: SelectedViewInfo;
}

export const SortByField: React.FC<IGroupByField> = (props) => {
    const { indexManager } = React.useContext(GlobalContext);
    const bref = React.useRef<HTMLButtonElement>(null);
    const fields = React.useMemo(
        () => indexManager.getFields(props.selectedFilters.appliedFilter),
        [indexManager]
    );

    const handleClick = (): void => {
        showListOptionsCallout(bref.current, {
            options: [{ key: null, text: '---' }].concat(
                fields.map((f) => makeSimpleListOption(f))
            ),
            onSelect: (op) => {
                dispatchItemUpdated(
                    SELECTED_VIEW,
                    changeSort(
                        props.selectedFilters.tempItem ||
                            getEmptySelectedView(),
                        op.key,
                        true
                    ).Fields,
                    { temp: true, persist: true }
                );
                hideListOptionsCallout();
            },
        });
    };

    const handleChangeSort = (): void => {
        dispatchItemUpdated(
            SELECTED_VIEW,
            changeSort(
                props.selectedFilters.tempItem || getEmptySelectedView(),
                props.selectedFilters.appliedSortField,
                !props.selectedFilters.appliedSortAsc
            ).Fields,
            { temp: true, persist: true }
        );
    };

    return (
        <div>
            <Label>
                <Icon iconName="Sort" /> Sort by
            </Label>
            <Stack tokens={{ childrenGap: '0.3em' }}>
                <button ref={bref} onClick={handleClick} className={styles.filterSortButton}>
                    {props.selectedFilters.appliedSortField || '---'}
                </button>
                <button onClick={handleChangeSort} className={styles.filterSortButton}>
                    {props.selectedFilters.appliedSortAsc ? (
                        <Icon iconName="SortUp" />
                    ) : (
                        <Icon iconName="SortDown" />
                    )}{' '}
                    {props.selectedFilters.appliedSortAsc
                        ? 'Ascending'
                        : 'Descending'}
                </button>
            </Stack>
        </div>
    );
};
