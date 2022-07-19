import {
    Checkbox,
    FocusTrapZone,
    IColumn,
    PrimaryButton,
    SearchBox,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { calloutVisibility } from '../../utils/dom-events';
import { TaskNode } from '../graph/TaskNode';
import styles from './Facet.module.scss';

export interface IChoiceFacetProps {
    options: TaskNode[];
    getValue: (t: TaskNode) => string;
    onFacetSet: (facets: Set<string>) => void;
    onFacetUnset: () => void;
    column: IColumn;
}

interface IFacetOption {
    label: string;
    items: TaskNode[];
}

export const ChoiceFacet: React.FC<IChoiceFacetProps> = (props) => {
    const searchRef = React.useRef(null);
    React.useEffect(() => {
        if (searchRef.current) {
            searchRef.current.focus()
        }
    }, [searchRef]);

    const [search, setSearch] = React.useState('');

    const options: IFacetOption[] = React.useMemo(() => {
        const result = {};
        props.options.forEach((node) => {
            const label = props.getValue(node);
            if (!label) return;
            if (!result[label] || !result[label].items) {
                result[label] = {
                    label,
                    items: [node],
                };
            } else {
                result[label].items.push(node);
            }
        });
        return Object.values(result);
    }, [props.options]);

    const shownOptions = React.useMemo(() => {
        return options.filter((o) =>
            o.items.some((n) => n.Display === 'shown')
        );
    }, [options]);

    const filteredOptions = React.useMemo(() => {
        const nSearch = search.toLowerCase();
        return options.filter((o) => o.label.toLowerCase().includes(nSearch));
    }, [options, search]);

    const [selected, setSelected] = React.useState(
        new Set(shownOptions.map((o) => o.label))
    );

    const handleSelectToggle = (label: string) => () => {
        if (selected.has(label)) {
            selected.delete(label);
        } else {
            selected.add(label);
        }
        setSelected(new Set(Array.from(selected)));
    };

    const handleSave = () => {
        let resultSet = selected;
        // If something is filtered, treat is as selected
        if (search !== '') {
            const filtered = new Set(filteredOptions.map((o) => o.label));
            Array.from(resultSet).forEach((label) => {
                if (!filtered.has(label)) {
                    resultSet.delete(label);
                }
            });
        }
        if (resultSet.size !== options.length) {
            props.onFacetSet(resultSet);
        } else {
            props.onFacetUnset();
        }
        calloutVisibility({ visible: false });
    };

    const handleSelectAllToggle = () => {
        if (selected.size === options.length) {
            setSelected(new Set([]));
        } else {
            setSelected(new Set(filteredOptions.map((o) => o.label)));
        }
        return;
    };

    const handleSearch = (_ev: any, newValue: string) => {
        setSearch(newValue);
    };

    return (
        <div
            style={{
                width: props.column.currentWidth,
            }}
            className={styles['facet__main']}
        >
            <div className={styles['facet__search']}>
                <SearchBox
                    componentRef={searchRef}
                    tabIndex={0}
                    value={search}
                    onChange={handleSearch}
                    clearButtonProps={{ tabIndex: -1 }}
                />
            </div>
            <div className={styles['facet__options']}>
                <Checkbox
                    label="Select all"
                    checked={selected.size === options.length}
                    onChange={handleSelectAllToggle}
                />
                {Object.values(filteredOptions).map((opt) => (
                    <Checkbox
                        inputProps={{ tabIndex: -1 }}
                        checked={selected.has(opt.label)}
                        label={opt.label}
                        onChange={handleSelectToggle(opt.label)}
                    />
                ))}
            </div>
            <PrimaryButton
                className={styles['facet__save-button']}
                onClick={handleSave}
            >
                Save
            </PrimaryButton>
        </div>
    );
};
