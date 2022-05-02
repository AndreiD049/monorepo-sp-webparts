import { IColumn, IDetailsRowProps } from 'office-ui-fabric-react';

export type ICellRenderer = (
    col: IColumn,
    props: IDetailsRowProps
) => React.ReactElement;
