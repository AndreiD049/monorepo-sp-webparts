import { MessageBarType } from '@fluentui/react';
import React from 'react';
import { Layout, Layouts } from 'react-grid-layout';
import { SPnotify } from 'sp-react-notifications';
import useWebStorage from 'use-web-storage-api';
import IConfig from '../models/IConfig';
import IUser from '../models/IUser';

export function getLayoutKey(currentUser?: IUser, selectedUser?: IUser): string {
    if (currentUser && selectedUser) {
        return currentUser.Id === selectedUser.Id ? 'Self' : 'Other';
    }
    return 'Default';
}

const COPY_LAYOUT_EVENT = 'sp-homepage-copy-layout';

export function copyLayoutsToClipboard(): void {
    document.dispatchEvent(new CustomEvent(COPY_LAYOUT_EVENT));
}

export const useLayout = (
    currentUser: IUser,
    selectedUser: IUser,
    config: IConfig,
): { layout: Layouts; handleLayoutChange: (l: Layout[], all: Layouts) => void } => {
    const [layouts, setLayouts] = useWebStorage<{ [key: string]: Layouts }>(
        {
            Default: config.defaultLayouts,
            Self: config.defaultLayouts,
            Other: config.defaultLayouts,
        },
        {
            key: `${location.host}${location.pathname}/${config.layoutsLocalStorageKey}`,
        }
    );

    const handleLayoutChange = React.useCallback(
        (_layouts: Layout[], allLayouts: Layouts) => {
            setLayouts((prev) => ({
                ...prev,
                [getLayoutKey(currentUser, selectedUser)]: allLayouts,
            }));
        },
        [currentUser, selectedUser]
    );

    React.useEffect(() => {
        async function handler(): Promise<void> {
            await navigator.clipboard.writeText(JSON.stringify(layouts[getLayoutKey(currentUser, selectedUser)]));
            SPnotify({
                message: 'Layout copied to clipboard',
                messageType: MessageBarType.success,
            })
        }
        document.addEventListener(COPY_LAYOUT_EVENT, handler);
        return () => document.removeEventListener(COPY_LAYOUT_EVENT, handler);
    }, [layouts, currentUser, selectedUser]);

    return {
        layout: layouts[getLayoutKey(currentUser, selectedUser)],
        handleLayoutChange,
    };
};
