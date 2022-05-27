import {
    Checkbox,
    getVirtualParent,
    IColumn,
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

export const ChoiceFacet: React.FC<IChoiceFacetProps> = (props) => {
    const selected = React.useMemo(
        () => props.options.filter((c) => c.isFilterApplicable),
        [props.options]
    );

    return (
        <div
            style={{
                width: props.column.currentWidth,
                maxHeight: '300px',
                padding: '0px 8px 0px 12px',
            }}
        >
            <SearchBox />
            <Separator />
            {props.options
                .sort((c) => (c.isFilterApplicable ? -1 : 0))
                .map((option) => (
                    <Stack
                        style={{ marginBottom: '.5em', cursor: 'pointer' }}
                        horizontal
                        tokens={{ childrenGap: 10 }}
                        onClick={(ev) =>
                            props.onChange([
                                ...selected.map((n) => props.getValue(n)),
                                props.getValue(option),
                            ])
                        }
                    >
                        <Checkbox checked={option.isFilterApplicable} />{' '}
                        {props.getValue(option)}
                    </Stack>
                ))}
        </div>
    );
};
