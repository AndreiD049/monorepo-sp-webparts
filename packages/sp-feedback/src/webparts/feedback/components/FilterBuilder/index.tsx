import { DirectionalHint, IconButton } from 'office-ui-fabric-react';
import * as React from 'react';
import { Callout, hideCallout, showCallout } from 'sp-components';
import FeedbackWebPart from '../../FeedbackWebPart';
import {
    $and,
    changeField,
    changeOp,
    changeValue,
    Filter,
    FILTER_OPS,
    getAllowedOps,
    getEmptyFilter,
    getFieldAndValue,
    getFilterOp,
    incPath,
    insertAtPath,
    isLogicOp,
    LOGIC_OPS,
    PathTokens,
    removeAtPath,
    replaceAtPath,
    traversePath,
} from '../../indexes/filter';
import { GlobalContext } from '../Feedback';
import styles from './FilterBuilder.module.scss';

const FILTER_CALLOUT = 'spfx/Feedback/Filter';

const FilterRowContext = React.createContext({
    filter: null,
    onChange: null,
    path: [],
    op: '',
    field: '',
    value: '',
    level: 0,
    defaultFilter: null,
});

export interface IFilterBuilderProps {
    filter: Filter;
    setFilter: React.Dispatch<React.SetStateAction<Filter>>;
    defaultFilter?: Filter;
}

const OptionsList: React.FC<{
    options: string[];
    onSelect?: (op: string) => void;
}> = ({ options, onSelect }) => {
    return (
        <ul>
            {options.map((o) => (
                <li key={o}>
                    <button onClick={() => onSelect(o)}>{o}</button>
                </li>
            ))}
        </ul>
    );
};

const CalloutButton: React.FC<{
    value: string | JSX.Element;
    onSelect: (newVlaue: string) => void;
    options: string[];
    className?: string;
}> = (props) => {
    const bref = React.useRef<HTMLElement>(null);
    const handleClick = (): void => {
        showCallout({
            id: FILTER_CALLOUT,
            calloutProps: {
                target: bref,
                directionalHint: DirectionalHint.bottomCenter,
                isBeakVisible: false,
            },
            content: (
                <OptionsList
                    options={props.options}
                    onSelect={(op) => {
                        props.onSelect(op);
                        hideCallout(FILTER_CALLOUT);
                    }}
                />
            ),
        });
    };
    
    if (typeof props.value !== 'string') {
        return (
            <div
                role="button"
                style={{ display: 'inline' }}
                ref={bref as React.MutableRefObject<HTMLDivElement>}
                onClick={handleClick}
            >
                {props.value}
            </div>
        );
    }
    return (
        <button
            className={props.className}
            ref={bref as React.MutableRefObject<HTMLButtonElement>}
            onClick={handleClick}
        >
            {props.value}
        </button>
    );
};

const FilterField: React.FC = () => {
    const { filter, path, onChange, field, defaultFilter } =
        React.useContext(FilterRowContext);
    const { indexManager } = React.useContext(GlobalContext);
    const options = React.useMemo(() => {
        return indexManager.getFields(defaultFilter);
    }, [indexManager, defaultFilter]);

    return (
        <CalloutButton
            className={`${styles.filterFieldContainer} ${styles.filterButton}`}
            options={options}
            value={field}
            onSelect={(newVal) =>
                onChange(
                    replaceAtPath(
                        filter,
                        changeField(filter, path, newVal),
                        path
                    )
                )
            }
        />
    );
};

const FilterValue: React.FC = () => {
    const { filter, path, onChange, field, value, defaultFilter } =
        React.useContext(FilterRowContext);
    const { indexManager } = React.useContext(GlobalContext);
    const options = React.useMemo(() => {
        return indexManager.getValues(field, defaultFilter);
    }, [field, indexManager, defaultFilter]);

    return (
        <CalloutButton
            className={`${styles.filterButton} ${styles.filterValueContainer}`}
            options={options}
            value={value !== '' ? value : "''"}
            onSelect={(newVal) =>
                onChange(
                    replaceAtPath(
                        filter,
                        changeValue(filter, path, newVal),
                        path
                    )
                )
            }
        />
    );
};

const FilterOp: React.FC<{ allowedOps: string[] }> = (props) => {
    const { filter, path, onChange, op } = React.useContext(FilterRowContext);
    return (
        <CalloutButton
            className={`${styles.filterButton} ${styles.filterOpContainer}`}
            value={op}
            options={props.allowedOps}
            onSelect={(newVal) =>
                onChange(
                    replaceAtPath(filter, changeOp(filter, path, newVal), path)
                )
            }
        />
    );
};

interface IFilterBuilderRowProps {
    type: 'op' | 'logic' | 'empty';
}

const FilterBuilderRow: React.FC<IFilterBuilderRowProps> = (props) => {
    const { filter, onChange, path, level } =
        React.useContext(FilterRowContext);
    const allowedOps = React.useMemo(() => getAllowedOps(path, filter), [path]);

    const handleDeleteRow = React.useCallback(() => {
        const newFilter = removeAtPath(filter, path);
        onChange(newFilter);
    }, [filter]);

    const handleAdd = React.useCallback(
        (newOp: string) => {
            const newFilter = getEmptyFilter(newOp);
            if (!filter) {
                return onChange(newFilter);
            }
            if (path.length === 0) {
                return onChange($and(filter, newFilter));
            }
            return onChange(insertAtPath(filter, newFilter, incPath(path)));
        },
        [filter]
    );

    const levelStyles: React.CSSProperties = {
        paddingLeft: 50 * level - 25,
        marginLeft: level === 0 ? 0 : 25,
    };
    if (level > 0) {
        levelStyles.borderLeft =
            '1px solid ' + FeedbackWebPart.theme.palette.themePrimary;
    }

    if (props.type === 'logic') {
        return (
            <div className={styles.filterRowContainer} style={levelStyles}>
                <IconButton
                    iconProps={{ iconName: 'Cancel' }}
                    onClick={handleDeleteRow}
                />
                <FilterOp allowedOps={LOGIC_OPS} />
                <CalloutButton
                    value={<IconButton iconProps={{ iconName: 'Add' }} />}
                    onSelect={handleAdd}
                    options={allowedOps}
                />
            </div>
        );
    }

    if (props.type === 'empty') {
        return (
            <div className={styles.filterRowContainer} style={levelStyles}>
                <CalloutButton
                    value={<IconButton iconProps={{ iconName: 'Add' }} />}
                    onSelect={handleAdd}
                    options={allowedOps}
                />
            </div>
        );
    }

    return (
        <div className={styles.filterRowContainer} style={levelStyles}>
            <IconButton
                iconProps={{ iconName: 'Cancel' }}
                onClick={handleDeleteRow}
            />
            <FilterField />
            <FilterOp allowedOps={FILTER_OPS} />
            <FilterValue />
            <CalloutButton
                value={<IconButton iconProps={{ iconName: 'Add' }} />}
                onSelect={handleAdd}
                options={allowedOps}
            />
        </div>
    );
};

const FilterElement: React.FC<{
    filter: Filter;
    onChange?: (filter: Filter) => void;
    path: PathTokens[];
    level: number;
    defaultFilter?: Filter;
}> = ({ filter, onChange, path, defaultFilter, level = 0 }) => {
    const fValue = React.useMemo(
        () => traversePath(filter, path),
        [filter, path]
    );

    if (Array.isArray(fValue)) return null;

    if (!filter) {
        return (
            <FilterRowContext.Provider
                value={{
                    filter,
                    path,
                    onChange,
                    op: '',
                    field: '',
                    value: '',
                    level,
                    defaultFilter,
                }}
            >
                <FilterBuilderRow type="empty" />
            </FilterRowContext.Provider>
        );
    }

    const op = getFilterOp(fValue);
    const [field, value] = getFieldAndValue(fValue);
    if (isLogicOp(op)) {
        const filters = fValue[op].map((_f, idx) => (
            <FilterElement
                key={`${path.join('/')}-${idx}`}
                filter={filter}
                onChange={onChange}
                path={[...path, op, idx]}
                level={level + 1}
                defaultFilter={defaultFilter}
            />
        ));
        return (
            <FilterRowContext.Provider
                value={{
                    filter,
                    path,
                    onChange,
                    op,
                    field,
                    value,
                    level,
                    defaultFilter,
                }}
            >
                <FilterBuilderRow type="logic" />
                {filters.length === 0 ? (
                    <FilterRowContext.Provider
                        value={{
                            filter,
                            path: [...path, op, 0],
                            onChange,
                            op,
                            field,
                            value,
                            level: level + 1,
                            defaultFilter,
                        }}
                    >
                        <FilterBuilderRow type="empty" />
                    </FilterRowContext.Provider>
                ) : (
                    filters
                )}
            </FilterRowContext.Provider>
        );
    }
    return (
        <FilterRowContext.Provider
            value={{
                filter,
                path,
                onChange,
                op,
                field,
                value,
                level,
                defaultFilter,
            }}
        >
            <FilterBuilderRow type="op" />
        </FilterRowContext.Provider>
    );
};

export const FilterBuilder: React.FC<IFilterBuilderProps> = ({
    filter,
    setFilter,
    defaultFilter,
}) => {
    return (
        <div className={styles.container}>
            <FilterElement
                filter={filter}
                onChange={(filter) => {
                    setFilter(filter);
                }}
                path={[]}
                level={0}
                defaultFilter={defaultFilter}
            />
            <Callout id={FILTER_CALLOUT} />
        </div>
    );
};
