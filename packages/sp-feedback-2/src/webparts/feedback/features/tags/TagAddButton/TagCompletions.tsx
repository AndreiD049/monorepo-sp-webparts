import * as React from 'react';
import { CompletionList, isIdxSelected, isNewValue, isNewValueSelected } from './completion-list';
import styles from './TagCompletions.module.scss';


export interface ITagCompletionsProps {
    list: CompletionList;
	handleSelect: (value: string) => void;
}

export const TagCompletions: React.FC<
    ITagCompletionsProps & React.HTMLAttributes<HTMLDivElement>
> = ({ list, ...props }) => {

	if (!list) return null;
	
	console.log(list.allowCustomValues);

    return (
        <div className={styles.container} {...props}>
            {list.filteredOptions.map((fo, idx) => (
                <div
                    className={`${styles.option} ${
                        isIdxSelected(list, idx) ? styles.selected : ''
                    }`}
					role="button"
					onClick={() => props.handleSelect(fo)}
                >
                    {fo}
                </div>
            ))}
            {list.allowCustomValues && isNewValue(list) && (
                <div
                    className={`${styles.option} ${
                        isNewValueSelected(list) ? styles.selected : ''
                    }`}
					role="button"
					onClick={() => props.handleSelect(list.value)}
                >
                    Create new value <b>"{list.value}"</b>
                </div>
            )}
        </div>
    );
};
