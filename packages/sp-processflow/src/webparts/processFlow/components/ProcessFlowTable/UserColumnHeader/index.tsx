import { IUserProps } from '@service/users';
import {
    IDetailsColumnProps,
    PersonaCoin,
    PersonaSize,
} from 'office-ui-fabric-react';
import * as React from 'react';
import styles from './UserColumnHeader.module.scss';

export interface IUserColumnHeaderProps {
    columnData: IDetailsColumnProps;
    defaultRender: (props?: IDetailsColumnProps) => JSX.Element;
}

export const UserColumnHeader: React.FC<IUserColumnHeaderProps> = (props) => {
    const user: IUserProps = props.columnData.column.data;
    return (
        <div className={styles.container} title={user.Title}>
            <PersonaCoin
                size={PersonaSize.size32}
                imageUrl={`/_layouts/15/userphoto.aspx?accountname=${user.EMail}&Size=S`}
            />
            <div className={styles.userTitle}>{user.Title}</div>
        </div>
    );
};
