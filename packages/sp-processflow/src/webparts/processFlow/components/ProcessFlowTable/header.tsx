import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { IDetailsGroupDividerProps } from 'office-ui-fabric-react';
import * as React from 'react';
import styles from './ProcessFlowTable.module.scss';

export function renderHeader(
    props: IDetailsGroupDividerProps,
    defaultRender: (props?: IDetailsGroupDividerProps) => JSX.Element
): JSX.Element {
    return <div className={styles.groupHeader}>{defaultRender(props)}</div>;
}

export const headerProps = (theme: IReadonlyTheme | undefined): {} => ({
    styles: {
        root: {
            '&:hover': {
                backgroundColor: theme?.palette.themePrimary,
            },
        },
        expand: {
            color: '#ffffff',
            '&:hover': {
                backgroundColor: theme?.palette.themePrimary,
            },
        },
    },
});
