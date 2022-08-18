import * as React from 'react';
import { GlobalContext } from '../../utils/GlobalContext';
import styles from './LinkRemoteDialog.module.scss';

export interface ILinkRemoteDialogProps {
    // Props go here
}

export const LinkRemoteDialog: React.FC<ILinkRemoteDialogProps> = (props) => {
    const { properties } = React.useContext(GlobalContext);
    return (
        <div>LinkRemoteDialog</div>
    );
};
