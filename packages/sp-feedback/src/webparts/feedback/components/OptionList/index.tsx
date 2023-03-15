import * as React from 'react';
import styles from './OptionList.module.scss';

export interface IOptionListProps {
    options: string[];
    allowNewVlaues?: boolean;
    onSelect?: (op: string) => void;
}

export interface IListOption {
    key: string | number;
    text: string | JSX.Element;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any;
}

export const OptionsList: React.FC<IOptionListProps> = ({
    options,
    onSelect,
    allowNewVlaues,
}) => {
    const [selectedIdx, setSelectedIdx] = React.useState(0);
    const input = React.useRef<HTMLInputElement>(null);
    const [search, setSearch] = React.useState('');

    const filteredOptions = React.useMemo(() => {
        if (search === '') return options;
        const searchL = search.toLowerCase();
        return options.filter((o) => o.toLowerCase().includes(searchL));
    }, [search]);

    const canCreateNew = React.useMemo(
        () => filteredOptions.length === 0 && allowNewVlaues,
        [filteredOptions, allowNewVlaues]
    );

    React.useEffect(() => {
        input.current.focus();
    }, [input]);

    const changeSelectedIndex = React.useCallback(
        (direction: 1 | -1): void => {
            setSelectedIdx((prev) => {
                const newIdx = prev + direction;
                if (newIdx < 0) {
                    return filteredOptions.length - 1;
                } else {
                    return newIdx % filteredOptions.length;
                }
            });
        },
        [filteredOptions]
    );

    const handleInput = React.useCallback(
        (ev: React.ChangeEvent<HTMLInputElement>) => {
            setSearch(ev.target.value);
            setSelectedIdx(0);
        },
        []
    );

    const selectAtIndex = React.useCallback(() => {
        const value = filteredOptions[selectedIdx];
        if (value) {
            onSelect(value);
        }
    }, [filteredOptions, selectedIdx]);

    React.useEffect(() => {
        function handler(ev: KeyboardEvent): void {
            const key = ev.key;
            if (key === 'ArrowDown') {
                changeSelectedIndex(1);
            } else if (key === 'ArrowUp') {
                changeSelectedIndex(-1);
            } else if (key === 'Enter') {
                ev.preventDefault();
                ev.stopPropagation();
                if (!canCreateNew) {
                    selectAtIndex();
                } else {
                    onSelect(search);
                }
            }
        }
        input.current.addEventListener('keydown', handler);

        return () => input.current.removeEventListener('keydown', handler);
    }, [input, filteredOptions, selectedIdx, search, canCreateNew]);

    const optionList = React.useMemo(() => {
        if (canCreateNew) {
            return (
                <div className={styles.defaultText}>
                    Create new value <strong>&quot;{search}&quot;</strong>
                </div>
            );
        }
        if (filteredOptions.length === 0) {
            return <div className={styles.defaultText}>No data...</div>;
        }
        return filteredOptions.map((o, idx) => (
            <li
                key={`${o}-${selectedIdx}`}
                className={`${styles.optionItem} ${
                    selectedIdx === idx ? styles.selected : ''
                }`}
            >
                <button onClick={() => onSelect(o)}>{o}</button>
            </li>
        ));
    }, [filteredOptions, selectedIdx, canCreateNew, search]);

    return (
        <div className={styles.container}>
            <input
                type="text"
                tabIndex={0}
                value={search}
                onChange={handleInput}
                ref={input}
                className={styles.optionSearch}
            />
            <ul className={styles.optionList}>{optionList}</ul>
        </div>
    );
};
