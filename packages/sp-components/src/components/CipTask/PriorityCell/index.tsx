import * as React from 'react';
import { Pill } from '../../Pill';
import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';

type IPriorityCellProps = {
    task: ITaskOverview;
    disabled?: boolean;
};

export const PriorityCell: React.FC<IPriorityCellProps> = (props) => {
    return (
        <div>
            <Pill
                style={{
                    height: '100%',
                    width: '100%',
                    borderRadius: '5px',
                }}
                value={props.task.Priority}
                disabled={props.disabled}
            />
        </div>
    );
};
