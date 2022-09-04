import { IconButton, Separator, Text } from 'office-ui-fabric-react';
import * as React from 'react';
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
    const { currentUser: currentUserInfo } = React.useContext(GlobalContext);
    const [users, setUsers] = React.useState([]);

    React.useEffect(() => {
        if (currentUserInfo) {
            props.handleTeamSelect(currentUserInfo?.teams[0] || null);
        }
    }, [currentUserInfo]);

    // every time the team changes. change user options
    React.useEffect(() => {
        async function run(): Promise<void> {
            if (props.team) {
                const users = await UserService.getCustomUsersByTeam(props.team);
                setUsers(users);
            }
        }
        run().catch((err) => console.error(err));
    }, [props.team]);

    return (
        <div>
            <div className={styles.commandBar}>
                <Text variant="mediumPlus">Homepage</Text>
                <IconButton
                    onClick={() => props.handleLock(!props.locked)}
                    iconProps={{ iconName: !props.locked ? 'Lock' : 'Unlock' }}
                />
                {props.team && (
                    <TeamSelector
                        teams={currentUserInfo.teams}
                        selectedTeam={props.team}
                        onTeamSelect={(team) => props.handleTeamSelect(team)}
                    />
                )}
                {props.team && (
                    <UserSelector
                        users={users}
                        selectedUser={props.user}
                        handleUserSelect={async (user) =>
                            props.handleUserSelect(await UserService.getUser(user.User.Id))
                        }
                    />
                )}
            </div>
            <Separator />
            {props.children}
        </div>
    );
};
