import { Persona, PersonaSize, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { GlobalContext } from '../../context/GlobalContext';
import { LoadingSpinner } from '../LoadingSpinner';
import styles from './UserInfo.module.scss';

export interface IUserInfoProps {
    // Props go here
}

export const UserInfo: React.FC<IUserInfoProps> = (props) => {
    const context = React.useContext(GlobalContext);

    let body;
    if (!context.selectedUser) {
        body = <LoadingSpinner />;
    } else {
        body = (
            <>
                <Persona
                    size={PersonaSize.size120}
                    text={context.selectedUser.Title}
                    secondaryText={context.selectedUser.Email}
                    onRenderSecondaryText={(props, defaultRender) => (<a href={`mailto:${context.selectedUser.Email}`}>{defaultRender()}</a>)}
                    onRenderTertiaryText={() => {
                        return (
                            <div>
                                <Text block variant="medium">
                                    {context.selectedUser.role}
                                </Text>
                                <Text block variant="medium">
                                    {context.selectedUser.teams.join(', ')}
                                </Text>
                            </div>
                        );
                    }}
                    imageUrl={`/_layouts/15/userphoto.aspx?accountname=${context.selectedUser.Email}&Size=L`}
                />
            </>
        );
    }

    return <div className={styles.container}>{body}</div>;
};
