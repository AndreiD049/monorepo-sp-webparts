import { Icon, Label, Stack } from 'office-ui-fabric-react';
import * as React from 'react';
import { SELECTED_FILTER } from '../../constants';
import { dispatchItemUpdated } from '../../services/events';
import {
    changeGroup,
    getEmptySelectedFilter,
    SelectedFilterInfo,
} from '../../services/saved-filter';
import { GlobalContext } from '../Feedback';
import {
    hideListOptionsCallout,
    makeSimpleListOption,
    showListOptionsCallout,
} from '../OptionList';
import styles from './FilterBuilder.module.scss';

export interface IGroupByField {
    selectedFilters: SelectedFilterInfo;
}

export const GroupByField: React.FC<IGroupByField> = (props) => {
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
                    SELECTED_FILTER,
                    changeGroup(
                        props.selectedFilters.tempItem ||
                            getEmptySelectedFilter(),
                        op.key
                    ).Fields
                );
                hideListOptionsCallout();
            },
        });
    };

    return (
        <div>
            <Stack>
                <Label>
                    <Icon iconName="GroupList" /> Group by
                </Label>
                <button ref={bref} onClick={handleClick} className={styles.filterSortButton}>
                    {props.selectedFilters.appliedGroupField || '---'}
                </button>
            </Stack>
        </div>
    );
};
