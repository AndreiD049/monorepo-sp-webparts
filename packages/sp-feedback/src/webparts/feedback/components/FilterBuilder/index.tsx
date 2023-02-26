import { DirectionalHint } from 'office-ui-fabric-react';
import * as React from 'react';
import { Callout, hideCallout, showCallout } from 'sp-components';
import {
    Filter,
    genericFilterOp,
    genericLogicOp,
    getAllowedAfter,
    getAllowedBefore,
    getFieldAndValue,
    getFilterOp,
    insertAtPath,
    isLogicOp,
    PathTokens,
    replaceAtPath,
    traversePath,
} from '../../indexes/filter';
import styles from './FilterBuilder.module.scss';

const FILTER_CALLOUT = 'spfx/Feedback/Filter';

export interface IFilterBuilderProps {
    // Props go here
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
    value: string;
    onSelect: (op: string) => void;
    options: string[];
}> = (props) => {
    const bref = React.useRef<HTMLButtonElement>(null);
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
    return (
        <button ref={bref} onClick={handleClick}>
            {props.value}
        </button>
    );
};

const FilterElement: React.FC<{
    filter: Filter;
    onChange?: (filter: Filter) => void;
    path: PathTokens[];
}> = ({ filter, onChange, path }) => {
    const [before, after] = React.useMemo(() => {
        const before = getAllowedBefore(path);
        const after = getAllowedAfter(path);
        const lastToken = path[path.length - 1];
        const canInsertAfter = typeof lastToken === 'number';
        const afterPath = path.slice();
        if (canInsertAfter) {
            afterPath[path.length - 1] = lastToken + 1;
        }
        const handleChange = (path: PathTokens[]) => (op: string) => {
            let newFilter: Filter;
            if (isLogicOp(op)) {
                const elemAtPath = traversePath(filter, path) as Filter;
                const newChildren = elemAtPath ? [elemAtPath] : [];
                console.log(filter, elemAtPath);
                newFilter = replaceAtPath(
                    filter,
                    genericLogicOp(op, newChildren),
                    path
                );
            } else {
                newFilter = insertAtPath(
                    filter,
                    genericFilterOp(op, 'test', 'test'),
                    path
                );
            }
            onChange(newFilter);
        };
        return [
            before ? (
                <CalloutButton
                    onSelect={handleChange(path)}
                    value="|"
                    options={before}
                />
            ) : null,
            after ? (
                <CalloutButton
                    onSelect={
                        canInsertAfter ? handleChange(afterPath) : () => null
                    }
                    value="|"
                    options={after}
                />
            ) : null,
        ];
    }, [path, filter]);
    const fValue = React.useMemo(
        () => traversePath(filter, path),
        [filter, path]
    );

    if (!filter || !fValue) {
        return (
            <>
                {before}
                {after}
            </>
        );
    }

    if (!Array.isArray(fValue)) {
        const op = getFilterOp(fValue);
        if (isLogicOp(op)) {
            const filters = fValue[op].map((_f, idx) => (
                <FilterElement
                    filter={filter}
                    onChange={onChange}
                    path={[...path, op, idx]}
                />
            ));
            if (filters.length === 0) {
                return (
                    <>
                        {before}
                        {op}(
                        <FilterElement
                            filter={filter}
                            onChange={onChange}
                            path={[...path, op, 0]}
                        />
                        ){after}
                    </>
                );
            }
            return (
                <>
                    {before}
                    {op}({filters}){after}
                </>
            );
        }
        const [field, value] = getFieldAndValue(fValue);
        return (
            <>
                {before}
                {op}({field}, {value}){after}
            </>
        );
    }
};

export const FilterBuilder: React.FC<IFilterBuilderProps> = (props) => {
    const [filter, setFilter] = React.useState<Filter>(null);

    return (
        <div className={styles.container}>
            <FilterElement
                filter={filter}
                onChange={(filter) => setFilter(filter)}
                path={[]}
            />
            <Callout id={FILTER_CALLOUT} />
        </div>
    );
};
