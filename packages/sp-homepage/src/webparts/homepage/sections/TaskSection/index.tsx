import * as React from 'react';
import { ISectionProps } from '../../components/Section';
import ITaskItem from '../../models/ITaskItem';
import SourceService from '../../services/SourceService';
import styles from './TaskSection.module.scss';

const select = ['Id', 'Status', 'Title', 'Time'];

export interface ITaskSectionProps extends ISectionProps {
    // Props go here
}

export const TaskSection: React.FC<ITaskSectionProps> = (props) => {
    const service = React.useMemo<SourceService>(
        () => new SourceService(props.section.sources[0], select),
        [props.section]
    );
    const [data, setData] = React.useState<ITaskItem[]>([]);

    React.useEffect(() => {
        async function run() {
            setData(await service.getSourceData<ITaskItem>());
        }
        run().catch((err) => console.error(err));
    }, [props.section]);

    return <div className={styles.container}>
        {
            data.map((task) => (<div>{task.Title}</div>))
        }
    </div>;
};
