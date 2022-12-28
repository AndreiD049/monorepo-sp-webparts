import { IconButton, Separator, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { Footer } from 'sp-components';
import { GlobalContext } from '../../context/GlobalContext';
import IUser from '../../models/IUser';
import UserService from '../../services/UserService';
import { TeamSelector } from '../TeamSelector';
import { UserSelector } from '../UserSelector';
import styles from './GridWrapper.module.scss';

export interface IGridWrapperProps extends React.PropsWithChildren<{}> {
    locked: boolean;
    handleLock: (locked: boolean) => void;
    team: string;
    handleTeamSelect: (team: string) => void;
    user: IUser;
    handleUserSelect: (user: IUser) => void;
}

export const GridWrapper: React.FC<IGridWrapperProps> = (props) => {
    const { config, teams } = React.useContext(GlobalContext);
    const [users, setUsers] = React.useState([]);

    React.useEffect(() => {
        if (teams.length === 1) {
            props.handleTeamSelect(teams[0]);
        }
    }, [teams]);

    // every time the team changes. change user options
    React.useEffect(() => {
        async function run(): Promise<void> {
            if (props.team) {
                const users = await UserService.getCustomUsersByTeam(props.team);
                setUsers(users);
                if (!props.user || !users.find((u) => u.User.Id === props.user.Id)) {
                    props.handleUserSelect(await UserService.getUser(users[0].User.Id));
                }
            }
        }
        run().catch((err) => console.error(err));
    }, [props.team]);

    return (
        <div>
            <div className={styles.commandBar}>
                <div className={styles.commandBarNearItems}>
                    <Text variant="xLarge">Homepage</Text>
                    <TeamSelector
                        teams={teams}
                        selectedTeam={props.team}
                        onTeamSelect={(team) => props.handleTeamSelect(team)}
                    />
                    <UserSelector
                        users={users || []}
                        selectedUser={props.user}
                        handleUserSelect={async (user) =>
                            props.handleUserSelect(await UserService.getUser(user.User.Id))
                        }
                    />
                </div>
                <IconButton
                    style={{
                        marginRight: '.5em',
                    }}
                    onClick={() => props.handleLock(!props.locked)}
                    iconProps={{ iconName: !props.locked ? 'Unlock' : 'Lock' }}
                />
            </div>
            <Separator />
            {props.children}
            <Footer email={config.contactEmail || 'noreply@domain.com'} />
        </div>
    );
};
