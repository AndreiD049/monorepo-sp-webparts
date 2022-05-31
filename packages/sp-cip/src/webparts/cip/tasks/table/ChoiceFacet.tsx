import { useConst } from '@uifabric/react-hooks';
import { eq, isEqualWith, result, setWith } from 'lodash';
import {
    Checkbox,
    getVirtualParent,
    IColumn,
    PrimaryButton,
    SearchBox,
    Separator,
    Stack,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { TaskNode } from '../graph/TaskNode';

export interface IChoiceFacetProps {
    options: TaskNode[];
    getValue: (t: TaskNode) => string;
    onChange: (facets: string[]) => void;
    column: IColumn;
}

function eqSet(as, bs) {
    if (as.size !== bs.size) return false;
    for (var a of as) if (!bs.has(a)) return false;
    return true;
}

export const ChoiceFacet: React.FC<IChoiceFacetProps> = (props) => {
    // const [selected, setSelected] = React.useState<TaskNode[]>([]);
    const [search, setSearch] = React.useState('');
    const [allSelected, setAllSelected] = React.useState(true);
    const [selectedValues, setSelectedValues] = React.useState<Set<string>>(new Set());

    const initialValuesSet = useConst(
        new Set(props.options.map((n) => props.getValue(n)))
    );
    const displayedItems = React.useMemo(
        () => {
            const result = props.options.filter((n) => {
                if (n.isFilterApplicable) {
                    if (search !== '') {
                        return (
                            props
                                .getValue(n)
                                .toLowerCase()
                                .indexOf(search.toLowerCase()) > -1
                        );
                    }
                    return true;
                }
                return false;
            });
            setSelectedValues(new Set(result.map((n) => props.getValue(n))));
            return result;
        },
        [search]
    );

    React.useEffect(() => {
        setAllSelected(displayedItems.every((n) => selectedValues.has(props.getValue(n))));
    }, [selectedValues]);

    return (
        <div
            style={{
                width: props.column.currentWidth,
                maxHeight: '400px',
                padding: '0px 8px 0px 12px',
                display: 'flex',
                flexFlow: 'column nowrap',
                alignItems: 'stretch',
                justifyContent: 'stretch',
            }}
        >
            <div
                style={{
                    paddingTop: '20px',
                }}
            >
                <SearchBox onChange={(_ev, val) => {
                    setSearch(val);
                }} />
            </div>
            <Separator />
            <div
                style={{
                    overflowY: 'auto',
                }}
            >
                {/* Select all checkbox */}
                <Checkbox
                    styles={{
                        root: {
                            marginTop: '10px',
                        },
                    }}
                    label="All"
                    checked={allSelected}
                    // onChange={(_ev, checked) => setSelectedValues(checked ? displayedItems : [])}
                />
                {/* Options checkboxes */}
                {displayedItems.map((option) => (
                    <Checkbox
                        key={option.Id}
                        styles={{
                            root: {
                                marginTop: '10px',
                            },
                        }}
                        label={props.getValue(option)}
                        checked={selectedValues.has(props.getValue(option))}
                        onChange={(ev, checked) => {
                            if (checked) {
                                setSelected((prev) => [...prev, option]);
                            } else {
                                setSelected((prev) =>
                                    prev.filter((node) => node.Id !== option.Id)
                                );
                            }
                        }}
                    />
                ))}
            </div>
            <Separator />
            <div
                style={{
                    paddingBottom: '15px'
                }}
            >
                <PrimaryButton disabled={eqSet(initialValuesSet, selectedValues)} onClick={() => props.onChange(Array.from(selectedValues.values()))}>
                    Apply
                </PrimaryButton>
            </div>
        </div>
    );
};
