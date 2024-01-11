import { IconButton, Separator, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { Footer } from 'sp-components';
import { GlobalContext } from '../../context/GlobalContext';
import { selectTeam, selectUser } from '../../events';
import IUser from '../../models/IUser';
import IUserCustom from '../../models/IUserCustom';
import UserService from '../../services/UserService';
import { TeamSelector } from '../TeamSelector';
import { UserSelector } from '../UserSelector';
import styles from './GridWrapper.module.scss';

export interface IGridWrapperProps extends React.PropsWithChildren<{}> {
    locked: boolean;
    handleLock: (locked: boolean) => void;
    team: string;
    user: IUser;
	users: IUserCustom[];
}

export const GridWrapper: React.FC<IGridWrapperProps> = (props) => {
    const { config, teams } =
        React.useContext(GlobalContext);

    React.useEffect(() => {
        if (teams !== undefined && teams.length === 1) {
			selectTeam(teams[0]);
        }
    }, [teams]);

    return (
        <div>
            <div className={styles.commandBar}>
                <div className={styles.commandBarNearItems}>
                    <Text variant="xLarge">Homepage</Text>
                    <TeamSelector
                        teams={teams}
                        selectedTeam={props.team}
                        onTeamSelect={(team) => {
							selectTeam(team);
						}}
                    />
                    <UserSelector
                        users={props.users || []}
                        selectedUser={props.user}
                        handleUserSelect={async (u) => {
							const user = await UserService.getUser(u.User.Id);
							selectUser(user);
                        }}
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
