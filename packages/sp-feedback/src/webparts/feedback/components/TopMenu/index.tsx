import { openDatabase, removeCached } from 'idb-proxy';
import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react';
import * as React from 'react';
import { Outlet, useNavigate } from 'react-router';
import { Panel } from 'sp-components';
import { DB_NAME, MAIN_PANEL, STORE_NAME } from '../../constants';
import FeedbackWebPart from '../../FeedbackWebPart';
import styles from './TopMenu.module.scss';

export interface ITopMenuProps {
    // Props go here
}

export const TopMenu: React.FC<ITopMenuProps> = (props) => {
    const navigate = useNavigate();

    // const item: ICommandBarItemProps = {
    //     buttonStyles: {
    //         root: {
    //             backgroundColor: FeedbackWebPart.theme.palette.themeLighterAlt,
    //         }
    //     }
    // }

    const buttonStyles = {
        backgroundColor: FeedbackWebPart.theme.palette.themeLighterAlt,
        '& :hover': {
            backgroundColor: FeedbackWebPart.theme.palette.themeLighter,
        },
    };

    const commandBarItems: ICommandBarItemProps[] = React.useMemo(() => {
        return [
            {
                key: 'new',
                text: 'New feedback',
                iconProps: { iconName: 'MegaphoneSolid' },
                onClick: () => navigate('/new?from=/'),
                buttonStyles: { root: buttonStyles },
            },
        ];
    }, []);

    const commandBarFarItems: ICommandBarItemProps[] = React.useMemo(() => {
        return [
            {
                key: 'refresh',
                iconOnly: true,
                iconProps: { iconName: 'Refresh' },
                onClick: () => {
                    const db = openDatabase(DB_NAME, STORE_NAME);
                    db.then((db) => {
                        const removed = removeCached(db, /.*/);
                        removed
                            .then(() => location.reload())
                            .catch((err) => console.error(err));
                    }).catch((err) => console.error(err));
                    return;
                },
                buttonStyles: {
                    root: buttonStyles
                }
            },
        ];
    }, []);

    return (
        <div className={styles.container}>
            <CommandBar
                styles={{
                    root: {
                        backgroundColor:
                            FeedbackWebPart.theme.palette.themeLighterAlt,
                    },
                    primarySet: {
                        backgroundColor:
                            FeedbackWebPart.theme.palette.themeLighterAlt,
                    },
                }}
                className={styles.topMenu}
                items={commandBarItems}
                farItems={commandBarFarItems}
            />
            <div className={styles.content}>
                <Outlet />
            </div>
            <Panel id={MAIN_PANEL} />
        </div>
    );
};
