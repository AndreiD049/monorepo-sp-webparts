import {
    Text,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { GlobalContext } from '../utils/GlobalContext';
import CipCommandBar from './CipCommandBar';
import styles from './Cip.module.scss';
import TasksTable from '../tasks/TasksTable';

const Cip: React.FC = () => {
    const ctx = React.useContext(GlobalContext);

    return (
        <div className={styles.cip}>
            <Text variant="xxLargePlus" className={styles.header} block>
                {ctx.properties.headerText}
            </Text>
            <CipCommandBar />

            <TasksTable />
        </div>
    );
};

export default Cip;
