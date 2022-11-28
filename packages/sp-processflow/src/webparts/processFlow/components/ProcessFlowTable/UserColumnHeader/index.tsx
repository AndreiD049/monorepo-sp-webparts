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
    return (
        <div className={styles.container}>
            <PersonaCoin
                size={PersonaSize.size32}
                imageUrl={`/_layouts/15/userphoto.aspx?accountname=${props.columnData.column.data.EMail}&Size=S`}
            />
            {props.defaultRender(props.columnData)}
        </div>
    );
};
