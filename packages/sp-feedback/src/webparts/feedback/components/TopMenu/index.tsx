import { openDatabase, removeCached } from 'idb-proxy';
import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react';
import * as React from 'react';
import { Outlet, useNavigate } from 'react-router';
import { Panel } from 'sp-components';
import { removeLocalCache } from '../../../../features/incremental-sync';
import {
    DB_NAME,
    INCREMENTAL_SYNC_CONFIG,
    MAIN_PANEL,
    STORE_NAME,
} from '../../constants';
import FeedbackWebPart from '../../FeedbackWebPart';
import { FilterDropdown } from '../FilterDropdown';
import { LayoutSelect } from '../LayoutSelect';
import styles from './TopMenu.module.scss';

export interface ITopMenuProps {
    // Props go here
}

export const TopMenu: React.FC<ITopMenuProps> = (props) => {
    const navigate = useNavigate();

    const buttonStyles = {
        backgroundColor: FeedbackWebPart.theme.palette.themePrimary,
        minHeight: 32,
        color: FeedbackWebPart.theme.palette.white,
    };

    const commandBarItems: ICommandBarItemProps[] = React.useMemo(() => {
        return [
            {
                key: 'new',
                text: 'New feedback',
                iconProps: {
                    iconName: 'MegaphoneSolid',
                    style: { color: FeedbackWebPart.theme.palette.white },
                },
                onClick: () => navigate('/new?from=/'),
                buttonStyles: { root: buttonStyles },
            },
        ];
    }, []);

    const commandBarFarItems: ICommandBarItemProps[] = React.useMemo(() => {
        return [
            {
                key: 'layout',
                onRender: () => <LayoutSelect />,
            },
            {
                key: 'filter',
                onRender: () => <FilterDropdown />,
            },
            {
                key: 'refresh',
                iconOnly: true,
                iconProps: {
                    iconName: 'Refresh',
                    style: { color: FeedbackWebPart.theme.palette.white },
                },
                onClick: () => {
                    async function run(): Promise<void> {
                        await removeLocalCache(INCREMENTAL_SYNC_CONFIG.dbName)
                        const db = await openDatabase(DB_NAME, STORE_NAME);
                        await removeCached(db, /.*/);
                        location.reload();
                    }
                    run().catch((err) => console.error(err));
                    return;
                },
                buttonStyles: {
                    root: buttonStyles,
                },
            },
        ];
    }, []);

    return (
        <div className={styles.container}>
            <CommandBar
                styles={{
                    root: {
                        backgroundColor:
                            FeedbackWebPart.theme.palette.themePrimary,
                        display: 'flex',
                        flexFlow: 'row nowrap',
                        alignItems: 'center',
                    },
                    primarySet: {
                        backgroundColor:
                            FeedbackWebPart.theme.palette.themePrimary,
                        gap: '.3em',
                    },
                    secondarySet: {
                        gap: '.3em',
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
