import { IReadonlyTheme } from '@microsoft/sp-component-base';
import {
    GroupHeader,
    IconButton,
    IDetailsGroupDividerProps,
} from '@fluentui/react';
import * as React from 'react';
import { swap } from '../../services/array-service';
import styles from './ProcessFlowTable.module.scss';

export function renderHeader(
    setGroupSorting: React.Dispatch<
        React.SetStateAction<{ [key: number]: string[] }>
    >,
    toggleGroup: (group: string) => void,
    flowId: number
): (props: IDetailsGroupDividerProps) => JSX.Element {
    return function (props: IDetailsGroupDividerProps): JSX.Element {
        const handleMove = (direction: -1 | 1): void => {
            const currentSorting: string[] = props.groups.map((g) => g.key);
            // See if we
            const newSorting = swap(
                currentSorting,
                props.groupIndex,
                props.groupIndex + direction
            );
            setGroupSorting((prev) => ({
                ...prev,
                [flowId]: newSorting,
            }));
        };
        return (
            <div className={styles.groupHeader}>
                <GroupHeader
                    {...props}
                    onToggleCollapse={() => toggleGroup(props.group.key)}
                    onRenderTitle={(props, defaultRender) => (
                        <div className={styles.groupHeaderTitleContainer}>
                            {defaultRender(props)}
                            <div>
                                {props.groupIndex > 0 && (
                                    <IconButton
                                        onClick={() => handleMove(-1)}
                                        className={styles.groupHeaderIcon}
                                        iconProps={{ iconName: 'SortUp' }}
                                    />
                                )}
                                {props.groupIndex < props.groups.length - 1 && (
                                    <IconButton
                                        onClick={() => handleMove(1)}
                                        className={styles.groupHeaderIcon}
                                        iconProps={{ iconName: 'SortDown' }}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                />
            </div>
        );
    };
}

export const headerProps = (theme: IReadonlyTheme | undefined): {} => ({
    styles: {
        root: {
            '&:hover': {
                backgroundColor: theme?.palette.themePrimary,
            },
			'& div[role="gridcell"]': {
				position: 'sticky',
				left: 0,
			},
			'& div[role="gridcell"] + div': {
				position: 'sticky',
				left: 40,
			}
        },
        expand: {
            color: '#ffffff',
            '&:hover': {
                backgroundColor: theme?.palette.themePrimary,
            },
        },
    },
});
