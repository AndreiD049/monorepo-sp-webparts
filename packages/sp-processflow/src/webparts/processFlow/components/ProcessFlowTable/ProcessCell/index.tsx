import { IProcess } from '@service/process-flow';
import { IconButton } from 'office-ui-fabric-react';
import * as React from 'react';
import styles from './ProcessCell.module.scss';

export interface IProcessCellProps {
    process: IProcess;
}

export const ProcessCell: React.FC<IProcessCellProps> = (props) => {
    return (
        <div className={styles.container}>
            <span>{props.process.Title}</span>
            {props.process.Manual && (
                <IconButton className={styles.manualInfo} title={props.process.Manual} iconProps={{ iconName: 'BookAnswers' }} onClick={() => {
                    window.open(props.process.Manual, '_blank', 'noreferrer,noopener');
                }} />
            )}
        </div>
    );
};
