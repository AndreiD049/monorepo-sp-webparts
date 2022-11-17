import * as React from 'react';
import { IProcessFlowWebPartProps } from '../ProcessFlowWebPart';
import { Header } from './Header';
import { IUser, UserService } from '@service/users';
import styles from './ProcessFlow.module.scss';
import { MainService } from '../services/main-service';
import { db } from '../utils/cache';

export interface IProcessFlowProps {
    properties: IProcessFlowWebPartProps;
}

export const ProcessFlow: React.FC<IProcessFlowProps> = (props) => {
    const service = MainService.UserService;
    const [currentUser, setCurrentUser] = React.useState<IUser>(null);

    // Get current user
    React.useEffect(() => {
        async function run(): Promise<void> {
            const current = await db.getCached('current', () => service.getCurrentUser());
            if (current.ListInfo.Teams.length > 0) {
                console.log(await db.getCached('teams', () => service.getUsersByTeam(current.ListInfo.Teams[0])));
            }
        }
        run().catch((err) => console.error(err));
    }, []);

    return (<div className={styles.processFlow}>
        <Header />
    </div>);
};
