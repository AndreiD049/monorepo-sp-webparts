import { uniq } from '@microsoft/sp-lodash-subset';
import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import {
    Checkbox,
    IColumn,
    PrimaryButton,
    SearchBox,
} from '@fluentui/react';
import * as React from 'react';
import { calloutVisibility } from '../../../utils/dom-events';
import { applyFilters, applySearch } from '../sort-filter/filtering';
import { ICipFilters } from '../sort-filter/filters-reducer';
import styles from './Facet.module.scss';

export interface IChoiceFacetProps {
    options: ITaskOverview[];
    getValue: (t: ITaskOverview) => string;
    onFacetSet: (facets: Set<string>) => void;
    onFacetUnset: () => void;
    column: IColumn;
	filters: ICipFilters;
}

export const ChoiceFacet: React.FC<IChoiceFacetProps> = (props) => {
    const searchRef = React.useRef(null);
    React.useEffect(() => {
        if (searchRef.current) {
            searchRef.current.focus();
        }
    }, [searchRef]);

    const [search, setSearch] = React.useState('');

    const availableOptions: string[] = React.useMemo(() => {
		let filtered = applySearch(props.options, props.filters.search);
		// Get facets except for the current one
		const otherColumnFacets = Object.keys(props.filters.facetFilters).filter((f) => f !== props.column.key);
		const otherFacets = otherColumnFacets.map((f) => props.filters.facetFilters[f]);
		filtered = applyFilters(filtered, otherFacets);
		return uniq(filtered.map((o) => props.getValue(o)));
    }, [props.options, props.filters]);

	const selectedOptions = React.useMemo(() => {
		let filtered = applySearch(props.options, props.filters.search);
		if (props.filters.facetFilters[props.column.key]) {
			filtered = applyFilters(filtered, [props.filters.facetFilters[props.column.key]]);
		}
		return uniq(filtered.map((o) => props.getValue(o)));
	}, [props.options, props.filters]);

    const optionsAfterSearch = React.useMemo(() => {
        const nSearch = search.toLowerCase();
        return availableOptions.filter((o) => o.toLowerCase().includes(nSearch));
    }, [availableOptions, search]);

    const [selected, setSelected] = React.useState(
        new Set(selectedOptions)
    );

    const handleSelectToggle = (label: string): () => void => () => {
        if (selected.has(label)) {
            selected.delete(label);
        } else {
            selected.add(label);
        }
        setSelected(new Set(Array.from(selected)));
    };

    const handleSave = (): void => {
        const resultSet = selected;
        // If something is filtered, treat is as selected
        if (search !== '') {
            const filtered = new Set(optionsAfterSearch);
            Array.from(resultSet).forEach((label) => {
                if (!filtered.has(label)) {
                    resultSet.delete(label);
                }
            });
        }
		if (resultSet.size === 0 || resultSet.size === availableOptions.length) {
            props.onFacetUnset();
		} else {
			props.onFacetSet(resultSet);
		}
        calloutVisibility({ visible: false });
    };

    const handleSelectAllToggle = (): void => {
        if (selected.size >= optionsAfterSearch.length) {
            setSelected(new Set([]));
        } else {
            setSelected(new Set(optionsAfterSearch));
        }
        return;
    };

    const handleSearch = (_ev: {}, newValue: string): void => {
        setSearch(newValue);
    };

    return (
        <div
            style={{
                width: props.column.currentWidth,
            }}
            className={styles.facet__main}
        >
            <div className={styles.facet__search}>
                <SearchBox
                    componentRef={searchRef}
                    tabIndex={0}
                    value={search}
                    onChange={handleSearch}
                    clearButtonProps={{ tabIndex: -1 }}
                />
            </div>
            <div className={styles.facet__options}>
                <Checkbox
                    label="Select all"
                    checked={selected.size === availableOptions.length}
                    onChange={handleSelectAllToggle}
                />
                {Object.values(optionsAfterSearch).map((opt) => (
                    <Checkbox
                        key={opt}
                        inputProps={{ tabIndex: -1 }}
                        checked={selected.has(opt)}
                        label={opt}
                        onChange={handleSelectToggle(opt)}
                    />
                ))}
            </div>
            <PrimaryButton
                className={styles['facet__save-button']}
                onClick={handleSave}
				disabled={selected.size === 0}
            >
                Save
            </PrimaryButton>
        </div>
    );
};

